import { Send } from "lucide-react";
import React, { useState } from "react";

const Form = ({setShowModal}) => {
    const [message, setMessage] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Message Sent Successfully")
    };

    return (
        <form className="contact-form" onSubmit={handleSubmit}>
            {message && <p>{message}</p> }
            <div className="form-items">
                <div className="form-group">
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            <div className="form-items">
                <div className="form-group">
                    <input
                        type="number"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="text"
                    name="subject"
                    placeholder="Enter your Subject..."
                    value={formData.subject}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            <div className="form-group">
                {/* <label>Your Message</label> */}
                <textarea
                    name="message"
                    placeholder="Write your message..."
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                ></textarea>
            </div>

            <button type="submit" className="contact-btn btn primary">
               <Send/> Send Message
            </button>
        </form>
    );
};

export default Form;
