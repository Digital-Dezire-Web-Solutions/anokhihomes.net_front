import React from "react";
import "./Banner.css";
import { Phone, Send } from "lucide-react";

const Banner = ({data}) => {
    return (
        <section className="hero">
            {/* LEFT */}
            <div className="hero-left">
                <h1>
                    {data?.title}
                    {/* Build <br />
                    Beautiful <br />
                    Applications */}
                </h1>

                <p>
                    {data?.description}
                </p>

                <div className="hero-actions">
                    <button className="btn primary"><Send />Get Your Plot Now</button>
                </div>
            </div>

            {/* RIGHT */}
            <div className="hero-right mosaic">
                <div className="right-left">
                    <div className="hero-card box-1">
                        <img src="https://images.unsplash.com/photo-1587745890135-20db8c79b027?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGxvdHxlbnwwfHwwfHx8Mg%3D%3D" alt="" />
                    </div>
                    <div className="hero-card box-2">
                        <img src="https://images.unsplash.com/photo-1461175827210-5ceac3e39dd2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGxvdHxlbnwwfHwwfHx8Mg%3D%3D" alt="" />
                    </div>
                    <div className="hero-card box-3">
                        <img src="https://images.unsplash.com/photo-1655319446878-44e5c1e31551?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGxvdHxlbnwwfHwwfHx8Mg%3D%3D" alt="" />
                    </div>
                    <div className="hero-card box-4">
                        <img src="https://images.unsplash.com/photo-1702357013751-69df806ce4c5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGxvdHxlbnwwfHwwfHx8Mg%3D%3D" alt="" />
                    </div>
                </div>
                <div className="right-left">
                    <div className="hero-card box-6">
                        <img src="https://images.unsplash.com/photo-1719760665658-855b83fba89b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBsb3R8ZW58MHx8MHx8fDI%3D" alt="" />
                    </div>
                    <div className="hero-card box-7">
                        <img src="https://images.unsplash.com/photo-1591389703635-e15a07b842d7?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFuZHxlbnwwfHwwfHx8Mg%3D%3D" alt="" />
                    </div>
                    <div className="hero-card box-8">
                        <img src="https://images.unsplash.com/photo-1518655513281-e90740bd56b0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGFuZHxlbnwwfHwwfHx8Mg%3D%3D" alt="" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;
