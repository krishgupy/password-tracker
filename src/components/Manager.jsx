import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const Manager = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ site: "", username: "", password: "" });
    const [passwords, setPasswords] = useState([]);
    const [editIndex, setEditIndex] = useState(null); // Track the index of the password being edited

    // Fetch passwords from the backend
    const getPasswords = async () => {
        try {
            const req = await fetch("http://localhost:3000/");
            const passwords = await req.json();
            setPasswords(passwords);  // Update state with fetched passwords
            console.log(passwords);
        } catch (error) {
            console.error('Error fetching passwords:', error);
            toast.error('Failed to load passwords.');
        }
    };
    

    useEffect(() => {
        getPasswords(); // Get passwords when the component mounts
    }, []);

    

    const savePass = async () => {
        const updatedPasswords = [...passwords];
    
        if (editIndex !== null) {
            // If editing an existing password, update the local state immediately
            updatedPasswords[editIndex] = form;
            setPasswords(updatedPasswords);
    
            try {
                // Send PUT request to the backend to update the password
                const response = await fetch('http://localhost:3000/password', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(form), // Send the updated password to the backend
                });
    
                const result = await response.json();
    
                if (response.ok) {
                    toast('Password updated successfully!');
                    getPasswords(); // Re-fetch passwords after update
                } else {
                    toast.error(result.message || 'Failed to update password.');
                }
            } catch (error) {
                console.error('Error updating password:', error);
                toast.error('Error updating password.');
            }
        } else {
            // If adding a new password
            try {
                const response = await fetch('http://localhost:3000', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(form), // Send the form data (password) to the backend
                });
    
                const result = await response.json();
    
                if (response.ok) {
                    getPasswords(); // Re-fetch passwords after adding the new one
                    toast('Password saved successfully!');
                } else {
                    toast.error(result.message || 'Failed to save password.');
                }
            } catch (error) {
                console.error('Error saving password:', error);
                toast.error('Error saving password.');
            }
        }
    
        // Reset form and edit index after saving
        setForm({ site: "", username: "", password: "" });
        setEditIndex(null);
    };
    
    
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast('🦄 Copied to the clipboard!');
        }).catch(err => {
            toast('🦄 Failed to copy!');
        });
    };

   
    const deletePassword = async (index) => {
        const passwordToDelete = passwords[index];
    
        try {
            // Send DELETE request to the backend to delete the password
            await fetch('http://localhost:3000', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordToDelete),
            });
    
            // After deletion, fetch the updated password list from the backend
            getPasswords(); // Re-fetch passwords from the backend
            toast('Password deleted!');
        } catch (error) {
            console.error('Error deleting password:', error);
            toast.error('Failed to delete password.');
        }
    };
    

    const editPassword = (index) => {
        const passwordToEdit = passwords[index];
        setForm({ site: passwordToEdit.site, username: passwordToEdit.username, password: passwordToEdit.password });
        setEditIndex(index); // Set the index of the password being edited
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-400 opacity-30 blur-[50px]"></div>
            </div>

            <div className="mx-auto px-4 sm:px-6 lg:px-40 py-16">
                <h1 className="text-4xl text-center mb-6">
                    <span className="text-green-700"> &lt; </span>
                    Pass
                    <span className="text-green-700 font-bold">OP/ &gt; </span>
                </h1>
                <p className="text-green-900 text-lg text-center mb-8">Your own Password Manager</p>

                <div className="flex flex-col gap-4 sm:gap-6">
                    <input
                        name="site"
                        value={form.site}
                        onChange={handleChange}
                        placeholder="Enter Website URL"
                        className="rounded-xl border border-green-700 w-full p-4 py-1"
                        type="text"
                    />

                    <div className="flex flex-col sm:flex-row sm:gap-8 w-full">
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Enter Username"
                            className="rounded-xl border border-green-700 w-full p-4 py-1"
                            type="text"
                        />

                        <div className="relative w-full">
                            <input
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter Password"
                                className="rounded-xl border border-green-700 w-full p-4 py-1 pr-10"
                                type={showPassword ? "text" : "password"}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <img src="https://cdn-icons-png.flaticon.com/512/2767/2767146.png" alt="Hide" width="24px" height="24px" />
                                ) : (
                                    <img src="https://cdn-icons-png.flaticon.com/512/2767/2767139.png" alt="Show" width="24px" height="24px" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 mt-4">
                        <button
                            onClick={savePass}
                            className="bg-green-700 text-white flex items-center justify-center gap-2 px-6 py-2 w-52 rounded-2xl shadow-md hover:bg-green-800 transition border border-green-700"
                        >
                            <span>{editIndex !== null ? "Update Password" : "Add Password"}</span>
                            <lord-icon
                                src="https://cdn.lordicon.com/jgnvfzqg.json"
                                trigger="hover"
                                style={{ width: "25px", height: "25px" }}
                            ></lord-icon>
                        </button>
                    </div>
                </div>

                {/* Password Table */}
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold text-center text-green-800">Saved Passwords</h2>
                    {passwords.length > 0 ? (
                        <div className="overflow-x-auto mt-4">
                            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-lg bg-green-600 text-white">
                                <thead className="bg-green-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Website</th>
                                        <th className="px-6 py-3 text-left">Username</th>
                                        <th className="px-6 py-3 text-left">Password</th>
                                        <th className="px-6 py-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {passwords.map((item, index) => (
                                        <tr
                                            key={index}
                                            className={index % 2 === 0 ? "bg-green-300 text-black" : "bg-green-200 text-black"}
                                        >
                                            <td className="py-4 px-6">
                                                <div onClick={() => copyToClipboard(item.site)} className="flex items-center justify-start gap-2 cursor-pointer">
                                                    <span>{item.site}</span>
                                                    <lord-icon
                                                        style={{ width: "20px", height: "20px" }}
                                                        src="https://cdn.lordicon.com/iykgtsbt.json"
                                                        trigger="hover"
                                                    ></lord-icon>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div onClick={() => copyToClipboard(item.username)} className="flex items-center justify-start gap-2 cursor-pointer">
                                                    <span>{item.username}</span>
                                                    <lord-icon
                                                        style={{ width: "20px", height: "20px" }}
                                                        src="https://cdn.lordicon.com/iykgtsbt.json"
                                                        trigger="hover"
                                                    ></lord-icon>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div onClick={() => copyToClipboard(item.password)} className="flex items-center justify-start gap-2 cursor-pointer">
                                                    <span>{item.password}</span>
                                                    <lord-icon
                                                        style={{ width: "20px", height: "20px" }}
                                                        src="https://cdn.lordicon.com/iykgtsbt.json"
                                                        trigger="hover"
                                                    ></lord-icon>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <button onClick={() => editPassword(index)} >
                                                    <lord-icon
                                                        src="https://cdn.lordicon.com/gwlusjdu.json"
                                                        trigger="hover"
                                                        style={{ "width": "25px", "height": "25px" }}></lord-icon>
                                                </button>
                                                <button onClick={() => deletePassword(index)} >
                                                    <lord-icon
                                                        src="https://cdn.lordicon.com/skkahier.json"
                                                        trigger="hover"
                                                        style={{ "width": "25px", "height": "25px" }}></lord-icon>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center mt-4">No passwords saved yet.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Manager;
