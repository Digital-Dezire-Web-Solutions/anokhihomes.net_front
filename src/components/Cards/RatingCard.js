import React, { useState } from "react";
import Stars from "../Utils/Stars";
import ViewModal from "../Modals/ViewModal";

const RatingCard = ({ item, mood, ratingData }) => {
    const [open, setOpen] = useState(false);
    const agentRatings = ratingData.filter(
        (r) => r.agent?._id === item._id
    );

    // console.log(agentRatings, "agentRatings")
    return (
        <>
            <div className="user-card card">
                <div className="user-card-top">
                    <div>
                        <h4>{item?.name}
                            <span
                                className={`status active`}>
                                {item.overallRating?.toFixed(1)}
                            </span>
                        </h4>
                    </div>

                    <div>
                        <Stars rating={item.overallRating} />
                    </div>
                </div>

                <div className="">
                    <div className="installment">
                        <span><strong>Lead Rating :</strong> </span>
                        <span><Stars rating={item.leadRating} /></span>
                    </div>
                    <div className="installment">
                        <span><strong>Site Visit Rating :</strong></span>
                        <span><Stars rating={item.siteVisitRating} /></span>
                    </div>
                    <div className="installment">
                        <span><strong>Booking Rating :</strong></span>
                        <span><Stars rating={item.bookingRating} /></span>
                    </div>
                    <div className="installment">
                        <span><strong>Customer Rating :</strong></span>
                        <span><Stars rating={item.customerRating} /></span>
                    </div>
                    <div className="installment">
                        <span><strong>Total Rating :</strong></span>
                        <span>{item.totalCustomerRatings}</span>
                    </div>
                </div>
                {(mood === "admin" || mood === "staff") &&
                    <div className="modal-actions">
                        <button
                            className=" view-report-btn" onClick={() => setOpen(true)}>
                            View Customers Rating
                        </button>
                    </div>
                }
            </div >

            <ViewModal
                open={open}
                onClose={() => setOpen(false)}
                title={`${item.name} Customers Rating`}
            >
                {/* <h4>Customers Rating</h4> */}
                {agentRatings.length === 0 ? (
                    <p>No ratings found</p>
                ) : (agentRatings.map((rating) => (
                    <>
                        <div className="installment">
                            <span><strong>{rating?.customer?.name}</strong> ({rating?.customer?.phone}) </span>
                            <span><Stars rating={rating.stars} /></span>
                        </div>
                    </>

                )))}
            </ViewModal>
        </>
    );
};

export default RatingCard;
