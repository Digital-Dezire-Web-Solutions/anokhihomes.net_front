import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import "./OffersDiscounts.css";
import NiSearch from "../../icons/ni-search";
import { LucidePlus } from "lucide-react";
import AddLocationModal from "../../components/Modals/AddLocationModal";

import OffersCard from "../../components/Cards/OffersCard";
import TargetCard from "../../components/Cards/TargetCard";
import TargetLadder from "../../components/Cards/Targetladder";
import { useDispatch, useSelector } from "react-redux";
import {
  getRoyaltyUsers,
  addOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  addDiscount,
  updateDiscount,
  deleteDiscount,
  toggleDiscountStatus,
  updateReward,
  getAccountDetails,
  getOffers,
  getRewards,
  getDiscount,
  getCashback,
  updateCashback,
  addCashback,
  deleteCashback,
  toggleCashbackStatus,
  getAllColonies,
  getMyRewards,
  claimRewardGift,
  claimRewardCash,
  getOfferClaims,
  deliverOfferReward,
} from "../../Redux/Slices/AppSlices";
import RoyaltyCard from "../../components/Cards/RoyaltyCard";
import SearchSelect from "../../components/SearchItems/SearchSelect";
import CashbackCard from "../../components/Cards/CashbackCard";
import { uploadImage } from "../LandingSetting/LandingApi";
import NiDelete from "../../icons/ni-delete";
import { LuPlus, LuX } from "react-icons/lu";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import formatDate from "../../components/DateFormate/DateFormate";

const ITEMS_PER_PAGE = 18;

const emptyRewardOption = () => ({
  type: "cash",
  title: "",
  description: "",
  value: 0,
});

const emptyMilestone = (sortOrder = 1) => ({
  sortOrder,
  conditionType: "booking",
  bookingCount: 1,
  paymentPercent: 100,
  businessAmount: 0,
  rewardMode: "direct",
  rewardOptions: [emptyRewardOption()],
});

const OffersDiscounts = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const {
    royaltyUsers,
    rewards,
    offersData,
    discountsData,
    cashbackData,
    allColonies,
    userDetail,
    myRewards,
    offerClaims
  } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(getAccountDetails());
  }, []);
  const [tab, setTab] = useState("offers");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(false);
  const [selectedOffers, setSelectedOffers] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState(null);

  const [formData, setFormData] = useState({
    milestones: [emptyMilestone()],
  });
  useEffect(() => {
    if (tab === "royalty") {
      dispatch(getRoyaltyUsers());
    }
    if (tab === "offers") {
      dispatch(getOffers());
    }

    if (tab === "discounts") {
      dispatch(getDiscount());
    }

    if (tab === "targets") {
      dispatch(getRewards());
      if (mood === "agent") {
        console.log(mood, "moood");
        dispatch(getMyRewards());
      }
    }
    if (tab === "cashback") {
      dispatch(getCashback());
      dispatch(getAllColonies());
    }
    if (tab === "claimed") {
      dispatch(getOfferClaims());
    }
  }, [tab]);

  useEffect(() => {
    if (selectedOffers) {
      setFormData(selectedOffers);

      if (selectedOffers.colonyId) {
        setSelectedProjects(selectedOffers.colonyId);
      }
    } else {
      setFormData({});
      setSelectedProjects(null);
    }
  }, [selectedOffers]);

  // console.log(cashbackData, "cashbackData");

  /* ---------- TAB DATA ---------- */
  useEffect(() => {
    setPage(1);
  }, [tab, search]);

  const tabData = useMemo(() => {
    if (tab === "offers") {
      console.log(offersData, "offersData")
      let offers = offersData || [];

      if (mood !== "admin" && mood !== "staff") {
        offers = offers.filter(
          (d) => d.status === "active",
        );
      }

      return offers;
    }

    if (tab === "discounts") {
      let discounts = discountsData || [];

      if (mood === "user") {
        discounts = discounts.filter((d) => d.status === "active");
      }

      return discounts;
    }

    if (tab === "targets") {
      return rewards || [];
    }

    if (tab === "royalty") {
      return royaltyUsers || [];
    }
    if (tab === "cashback") {
      return cashbackData || [];
    }
    if (tab === "claimed") {
      return offerClaims || [];
    }
    return [];
  }, [
    tab,
    mood,
    rewards,
    royaltyUsers,
    offersData,
    discountsData,
    cashbackData,
  ]);

  /* ---------- SEARCH ---------- */

  const filtered = useMemo(() => {
    if (!search) return tabData;

    return tabData.filter((item) => {
      const text = search.toLowerCase();

      return (
        (item?.rewardName || "").toLowerCase().includes(text) ||
        (item?.title || "").toLowerCase().includes(text) ||
        (item?.user?.name || "").toLowerCase().includes(text) ||
        (item?.colonyId?.name || "").toLowerCase().includes(text)
      );
    });
  }, [search, tabData]);

  /* ---------- PAGINATION ---------- */

  const totalPages = Math.ceil(filtered?.length / ITEMS_PER_PAGE);
  console.log(filtered, "filtered")

  const paginated = filtered?.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  /* ---------- SAVE ---------- */

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];

      // 1 MB = 1024 * 1024 bytes
      if (file.size > 10 * 1024 * 1024) {
        setAlert({
          message: "Please upload an image smaller than 1 MB",
          status: "Error",
        });

        setTimeout(() => setAlert(null), 3000);

        e.target.value = "";
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: file,
        preview: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      let response;
      let uploadedImage = null;

      if (formData.image instanceof File) {
        const response = await uploadImage(formData.image);
        uploadedImage = response?.url;
      }
      const payload = {
        title: formData.title,
        description: formData.description,
        poster: uploadedImage || formData.poster,
        offerCategory: formData.offerCategory,
        colonyIds: formData.colonyId ? [formData.colonyId] : [],
        applicableFor: formData.applicableFor,
        milestones: formData.milestones,
        terms: formData.terms,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
      };

      if (tab === "offers") {
        response = isEditMode
          ? await dispatch(
            updateOffer({
              id: formData._id,

              data: payload,
            }),
          )
          : await dispatch(addOffer(payload));
      }

      // if (tab === "discounts") {
      //   response = isEditMode
      //     ? await dispatch(
      //       updateDiscount({
      //         id: formData._id,
      //         data: formData,
      //       }),
      //     )
      //     : await dispatch(addDiscount(formData));
      // }

      if (tab === "targets") {
        response = await dispatch(updateReward(formData));
      }

      if (tab === "cashback") {
        response = isEditMode
          ? await dispatch(
            updateCashback({
              id: formData._id,
              data: formData,
            }),
          )
          : await dispatch(addCashback(formData));
      }

      setAlert({
        message: isEditMode ? "Updated Successfully" : "Added Successfully",
        status: "Success",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      dispatch(getOffers());
      // dispatch(getDiscount());
      dispatch(getRewards());
      dispatch(getCashback());

      setSaving(false);
      setOpen(false);
    } catch (error) {
      setAlert({
        message: "Something went wrong",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      if (tab === "offers") {
        await dispatch(deleteOffer(id));
        dispatch(getOffers());
      }

      if (tab === "discounts") {
        await dispatch(deleteDiscount(id));
        dispatch(getDiscount());
      }

      if (tab === "cashback") {
        await dispatch(deleteCashback(id));
        dispatch(getCashback());
      }

      setAlert({
        message: "Deleted Successfully",
        status: "Success",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false);
    } catch (error) {
      setAlert({
        message: "Delete Failed",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item) => {
    setSaving(true);
    try {
      if (tab === "offers") {
        await dispatch(toggleOfferStatus(item._id));
        dispatch(getOffers());
      }

      if (tab === "discounts") {
        await dispatch(toggleDiscountStatus(item._id));
        dispatch(getDiscount());
      }
      if (tab === "cashback") {
        await dispatch(toggleCashbackStatus(item._id));
        dispatch(getCashback());
      }
      setSaving(false);
    } catch (error) {
      console.log(error);
      setSaving(false);
    }
  };

  const handleClaimCash = async (id) => {
    setSaving(true);
    try {
      await dispatch(claimRewardCash(id)).unwrap();

      dispatch(getMyRewards());
      dispatch(getAccountDetails());

      setAlert({
        message: "Reward claimed successfully",
        status: "Success",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false);
    } catch (error) {
      setAlert({
        message: error?.msg || "Failed",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false);
    }
  };

  const handleClaimGift = async (id) => {
    setSaving(true);
    try {
      await dispatch(claimRewardGift(id)).unwrap();

      dispatch(getMyRewards());

      setAlert({
        message: "Reward claimed successfully",
        status: "Success",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false);
    } catch (error) {
      setAlert({
        message: error?.msg || "Failed",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false);
    }
  };

  /* ---------- MILESTONE HELPERS ---------- */
  const updateMilestone = (index, patch) => {
    const updated = [...formData.milestones];
    updated[index] = { ...updated[index], ...patch };
    setFormData({ ...formData, milestones: updated });
  };

  const removeMilestone = (index) => {
    const updated = [...formData.milestones];
    updated.splice(index, 1);
    updated.forEach((item, i) => {
      item.sortOrder = i + 1;
    });
    setFormData({ ...formData, milestones: updated });
  };

  const addMilestone = () => {
    const current = formData.milestones || [];
    setFormData({
      ...formData,
      milestones: [...current, emptyMilestone(current.length + 1)],
    });
  };

  const updateReward_ = (milestoneIndex, rewardIdx, patch) => {
    const updated = [...formData.milestones];
    const rewards = [...updated[milestoneIndex].rewardOptions];
    rewards[rewardIdx] = { ...rewards[rewardIdx], ...patch };
    updated[milestoneIndex] = {
      ...updated[milestoneIndex],
      rewardOptions: rewards,
    };
    setFormData({ ...formData, milestones: updated });
  };

  const removeReward = (milestoneIndex, rewardIdx) => {
    const updated = [...formData.milestones];
    updated[milestoneIndex].rewardOptions.splice(rewardIdx, 1);
    setFormData({ ...formData, milestones: updated });
  };

  const addReward = (milestoneIndex) => {
    const updated = [...formData.milestones];
    updated[milestoneIndex].rewardOptions.push(emptyRewardOption());
    setFormData({ ...formData, milestones: updated });
  };

  const thStyle = {
    border: "1px solid #ddd",
    padding: "10px",
    textAlign: "left",
    background: "#f7f7f7",
    fontWeight: 600,
  };

  const tdStyle = {
    border: "1px solid #ddd",
    padding: "10px",
  };

  const handleDeliverReward = async (id) => {
    try {

      await dispatch(
        deliverOfferReward({
          id,
          remarks: "Delivered by Admin",
        })
      ).unwrap();

      dispatch(getOfferClaims());

      setAlert({
        status: "Success",
        message: "Reward marked as delivered.",
      });

      setTimeout(() => {
        setAlert(null);
      }, 3000);

    } catch (err) {

      setAlert({
        status: "Error",
        message: err?.message || "Something went wrong",
      });

      setTimeout(() => {
        setAlert(null);
      }, 3000);
    }
  };

  return (
    <div className="plot-container">
      {/* HEADER */}

      <div className="table-filters">
        <div className="page-head-title">
          <h2>Matching Rewards & Awards</h2>
          <Breadcrumb />
        </div>
      </div>
      <div className="table-filters">
        <div className="page-tools">
          {mood === "admin" &&
            (tab === "offers" || tab === "discounts" || tab === "cashback") && (
              <button
                className="add-button"
                onClick={() => {
                  setSelectedOffers(null);
                  setIsEditMode(false);
                  setFormData({});
                  setOpen(true);
                }}
              >
                <LucidePlus /> Add
              </button>
            )}

          <div className="searchItem">
            <NiSearch />
            <input
              placeholder="Search title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* TABS */}

          <div className="filter-buttons">
            {mood === "admin" && (
              <>
                <button
                  className={tab === "royalty" ? "active" : ""}
                  onClick={() => setTab("royalty")}
                >
                  Royalty Holders
                </button>
              </>
            )}
            <button
              className={tab === "offers" ? "active" : ""}
              onClick={() => setTab("offers")}
            >
              Festival Offers & Bonanza
            </button>

            {/* <button
              className={tab === "discounts" ? "active" : ""}
              onClick={() => setTab("discounts")}
            >
              Bonanza
            </button> */}

            <button
              className={tab === "targets" ? "active" : ""}
              onClick={() => setTab("targets")}
            >
              Rewards
            </button>
            <button
              className={tab === "cashback" ? "active" : ""}
              onClick={() => setTab("cashback")}
            >
              Cashback
            </button>
            {(mood === "admin" || mood === "staff") && (
              <button
                className={tab === "claimed" ? "active" : ""}
                onClick={() => setTab("claimed")}
              >
                Claimed Rewards
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CARDS */}
      {tab === "targets" && mood === "agent" && (
        <>
          <h4>Sales Target Ladder</h4>
          <TargetLadder
            targets={rewards}
            agentSales={userDetail?.matchedBusiness || 0}
          />
        </>
      )}

      <div className="user-card-box">
        {tab === "targets" &&
          paginated.map((item) => (
            <TargetCard
              key={item._id}
              item={item}
              agentSales={userDetail?.matchedBusiness}
              setSelectedOffers={setSelectedOffers}
              setIsEditMode={setIsEditMode}
              setOpen={setOpen}
              mood={mood}
              setAlert={setAlert}
              myRewards={myRewards}
              ClaimCash={handleClaimCash}
              ClaimGift={handleClaimGift}
              saving={saving}
            />
          ))}

        {tab === "royalty" &&
          paginated.map((item) => <RoyaltyCard key={item._id} item={item} />)}

        {tab === "offers" &&
          paginated.map((item) => (
            <OffersCard
              key={item._id}
              item={item}
              handleToggleStatus={handleToggleStatus}
              handleDelete={handleDelete}
              setSelectedOffers={setSelectedOffers}
              setIsEditMode={setIsEditMode}
              setOpen={setOpen}
              mood={mood}
              setAlert={setAlert}
              saving={saving}
            />
          ))}
        {tab === "cashback" &&
          paginated.map((item) => (
            <CashbackCard
              key={item._id}
              mood={mood}
              item={item}
              handleDelete={handleDelete}
              handleToggleStatus={handleToggleStatus}
              setSelectedOffers={setSelectedOffers}
              setIsEditMode={setIsEditMode}
              setOpen={setOpen}
              setAlert={setAlert}
              saving={saving}
            />
          ))}
        {tab === "claimed" && (
          <div className="card claimreward-table">
            <div className="table">
              <div className="table-head">
                <span>Associate</span>
                <span>Offer</span>
                <span>Reward</span>
                <span>Status</span>
                <span>Claimed</span>
                <span>Action</span>
              </div>
              {paginated.map((claim) => (
                <div
                  key={claim._id}
                  className="table-row"
                >
                  <span>
                    {claim.agent?.name}
                  </span>
                  <span>
                    {claim.offer?.title}
                  </span>
                  <span>
                    {claim.selectedReward?.type === "reward"
                      ? claim.selectedReward.title
                      : `₹${formatCurrency(claim.selectedReward?.value)}`}
                  </span>
                  <span>
                    {claim.status === "claimed" && (
                      <span className="status active">
                        Cash Claimed
                      </span>
                    )}
                    {claim.status === "undelivered" && (
                      <span className="status pending2">
                        Undelivered
                      </span>
                    )}
                    {claim.status === "delivered" && (
                      <span className="status active">
                        Delivered
                      </span>
                    )}
                  </span>
                  <span>
                    {formatDate(claim.claimedAt)}
                  </span>
                  <span>
                    {claim.status === "undelivered" ? (
                      <button
                        onClick={() =>
                          handleDeliverReward(claim._id)
                        }
                      >
                        Deliver
                      </button>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
              ))}
              {paginated.length === 0 &&
                <p>No Data Found</p>
                }
            </div>
          </div>
        )}
      </div>

      {/* PAGINATION */}

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "active" : ""}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* MODAL */}

      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={
          tab === "targets"
            ? "Edit Reward"
            : `${isEditMode ? "Edit" : "Add"} ${tab === "offers"
              ? "Offer"
              : tab === "discounts"
                ? "Discount"
                : "Cashback"
            }`
        }
      >
        {tab === "cashback" && (
          <>
            <div className="field">
              <SearchSelect
                label="Site"
                placeholder="Search Project or location"
                options={allColonies}
                value={selectedProjects}
                onChange={(selected) => {
                  setSelectedProjects(selected);
                  setFormData({ ...formData, colonyId: selected._id });
                }}
                displayKey="name"
                searchKeys={["name", "location"]}
                renderOption={(p) => (
                  <div>
                    <b>{p.name}</b>
                    <small style={{ display: "block", color: "#666" }}>
                      {p?.locationId?.name}
                    </small>
                  </div>
                )}
              />
            </div>

            <div className="field">
              <label>Cashback %</label>

              <select
                value={formData.cashbackPercent || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cashbackPercent: Number(e.target.value),
                  })
                }
              >
                <option value="">Select Cashback %</option>
                <option value={1}>1%</option>
                <option value={2}>2%</option>
                <option value={3}>3%</option>
                <option value={4}>4%</option>
                <option value={5}>5%</option>
              </select>
            </div>

            <div className="field">
              <label>Complete Within Days</label>

              <input
                type="number"
                value={formData.completeWithinDays || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    completeWithinDays: e.target.value,
                  })
                }
              />
            </div>

            <div className="field">
              <label>Start Date</label>

              <input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startDate: e.target.value,
                  })
                }
              />
            </div>

            <div className="field">
              <label>End Date</label>

              <input
                type="date"
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="field">
              <label>Status</label>
              <select
                value={formData.active}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    active: e.target.value === "true",
                  })
                }
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>
          </>
        )}
        {tab === "offers" && (
          <>
            <div className="field">
              <label>Offer Title</label>
              <input
                type="text"
                placeholder="Enter Offer Title"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                rows={4}
                placeholder="Offer Description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>Offer Category</label>
              <select
                value={formData.offerCategory}
                onChange={(e) =>
                  setFormData({ ...formData, offerCategory: e.target.value })
                }>
                <option value="">Select Option</option>
                <option value="booking">Booking</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div className="field">
              <label>Offer Poster</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />

              {/* Single, consolidated preview — the original file had a second
                  "Poster Preview" block further down that re-ran
                  URL.createObjectURL(formData.poster) on every render (a
                  memory leak) and duplicated this same image. Removed. */}
              {(formData.preview || formData.poster) && (
                <div style={{ marginTop: 12 }}>
                  <img
                    src={formData.preview || formData.poster}
                    alt="Poster"
                    style={{
                      width: 220,
                      maxWidth: "100%",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </div>

            {/* <div className="field">
              <SearchSelect
                label="Project"
                placeholder="Search Project"
                options={allColonies}
                value={selectedProjects}
                displayKey="name"
                searchKeys={["name", "location"]}
                onChange={(selected) => {
                  setSelectedProjects(selected);
                  setFormData({
                    ...formData,
                    colonyId: selected?._id || "",
                  });
                }}
                renderOption={(project) => (
                  <div>
                    <strong>{project.name}</strong>
                    <small style={{ display: "block", color: "#666" }}>
                      {project?.locationId?.name}
                    </small>
                  </div>
                )}
              />
            </div> */}

            {/* "Applicable For" checkboxes were commented out in the original.
                Left commented here too since payload.applicableFor is still
                referenced — re-enable if you want it editable again. */}
            {/*
            <div className="field">
              <label>Applicable For</label>
              <div className="checkbox-group" style={{ display: "flex", gap: 15, flexWrap: "wrap", marginTop: 10 }}>
                {["user", "agent", "staff"].map((role) => (
                  <label key={role} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.applicableFor?.includes(role) || false}
                      onChange={(e) => {
                        let updated = [...(formData.applicableFor || [])];
                        if (e.target.checked) {
                          if (!updated.includes(role)) updated.push(role);
                        } else {
                          updated = updated.filter((r) => r !== role);
                        }
                        setFormData({ ...formData, applicableFor: updated });
                      }}
                    />
                    <span style={{ textTransform: "capitalize" }}>{role}</span>
                  </label>
                ))}
              </div>
            </div>
            */}

            <div className="field">
              <label>
                Terms & Conditions{" "}
                <small
                  style={{ color: "#888", marginTop: 5, display: "block" }}
                >
                  (Enter multiple terms separated by commas.)
                </small>
              </label>
              <textarea
                rows={4}
                placeholder={
                  "Example:\nBooking should be approved,\nCustomer payment must be verified"
                }
                value={formData.termsText || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    termsText: value,
                    terms: value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  });
                }}
              />

              {formData.terms?.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {formData.terms.map((term, index) => (
                    <span
                      key={index}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 20,
                        background: "#f3f3f3",
                        border: "1px solid #ddd",
                        fontSize: 13,
                      }}
                    >
                      {term}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="field">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label>End Date</label>
              <input
                type="date"
                min={formData.startDate || ""}
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label>Status</label>
              <select
                value={formData.status || "draft"}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="field">
              <label
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 15,
                  display: "block",
                }}
              >
                Milestones
              </label>

              {formData.milestones?.map((milestone, index) => (
                // FIX: key belongs on the element React.Fragment returns from
                // the map, not just on the inner div — otherwise React can't
                // reliably track/reorder these list items.
                <React.Fragment key={index}>
                  <div
                    style={{
                      border: "1px solid #bcbcbc2e",
                      borderRadius: "1.75rem",
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                      }}
                    >
                      <h4 style={{ margin: 0 }}>Milestone {index + 1}</h4>

                      {formData.milestones.length > 1 && (
                        <div className="modal-actions">
                          <button
                            type="button"
                            onClick={() => removeMilestone(index)}
                          // style={{
                          //   background: "#dc3545",
                          //   color: "#fff",
                          //   border: "none",
                          //   padding: "7px 12px",
                          //   borderRadius: "1.75rem",
                          //   cursor: "pointer",
                          // }}
                          >
                            <NiDelete />  Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="field">
                      <label>Condition Type</label>
                      <select
                        value={milestone.conditionType}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "booking") {
                            updateMilestone(index, {
                              conditionType: value,
                              bookingCount: 1,
                              paymentPercent: 100,
                              businessAmount: 0,
                            });
                          } else {
                            updateMilestone(index, {
                              conditionType: value,
                              bookingCount: 0,
                              paymentPercent: 0,
                            });
                          }
                        }}
                      >
                        <option value="booking">Booking</option>
                        <option value="self_business">Self Business</option>
                      </select>
                    </div>

                    {milestone.conditionType === "booking" && (
                      <div className="field">
                        <label>Booking Count</label>
                        <input
                          type="number"
                          value={milestone.bookingCount || ""}
                          onChange={(e) =>
                            updateMilestone(index, {
                              bookingCount: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    )}
                    {milestone.conditionType === "booking" && (
                      <div className="field">
                        <label>Eligible Payment Stage</label>

                        <select
                          value={milestone.paymentType}
                          onChange={(e) =>
                            updateMilestone(index, {
                              paymentType: e.target.value,
                            })
                          }
                        >
                          <option value="booking">Booking Amount</option>
                          <option value="agreement">Agreement Amount</option>
                          <option value="full">Full Payment</option>
                          <option value="percentage">Custom Percentage</option>
                        </select>
                      </div>
                    )}


                    {milestone.conditionType === "booking" && (
                      <div className="field">
                        <label>Required Payment Percentage</label>
                        <input
                          type="number"
                          max={100}
                          placeholder="30"
                          value={milestone.paymentPercent || ""}
                          onChange={(e) =>
                            updateMilestone(index, {
                              paymentPercent: Number(e.target.value),
                            })
                          }
                        />
                        <small
                          style={{
                            color: "#666",
                            display: "block",
                            marginTop: 5,
                          }}
                        >
                          Example:
                          <br />
                          30 = customer paid at least 30%
                          <br />
                          100 = full payment completed
                        </small>
                      </div>
                    )}

                    {milestone.conditionType !== "booking" && (
                      <div className="field">
                        <label>Business Target (₹)</label>
                        <input
                          type="number"
                          placeholder="1000000"
                          value={milestone.businessAmount || ""}
                          onChange={(e) =>
                            updateMilestone(index, {
                              businessAmount: Number(e.target.value),
                            })
                          }
                        />
                        <small
                          style={{
                            color: "#666",
                            display: "block",
                            marginTop: 5,
                          }}
                        >
                          Example:
                          <br />
                          ₹10,00,000 = 1000000
                          <br />
                          ₹25,00,000 = 2500000
                        </small>
                      </div>
                    )}

                    <div className="field">
                      <label>Reward Mode</label>
                      <select
                        value={milestone.rewardMode || "direct"}
                        onChange={(e) => {
                          const value = e.target.value;
                          const needsDefaultOption =
                            !milestone.rewardOptions ||
                            milestone.rewardOptions.length === 0;
                          updateMilestone(index, {
                            rewardMode: value,
                            rewardOptions: needsDefaultOption
                              ? [emptyRewardOption()]
                              : milestone.rewardOptions,
                          });
                        }}
                      >
                        <option value="direct">Direct Reward</option>
                        <option value="choice">Choice Reward</option>
                      </select>
                      <small
                        style={{
                          color: "#666",
                          display: "block",
                          marginTop: 5,
                        }}
                      >
                        Direct = Agent receives the configured reward
                        automatically.
                        <br />
                        Choice = Agent can choose one reward from multiple
                        options.
                      </small>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 20,
                      // border: "1px solid #ddd",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div className="card reward-table">
                      <div className="table ">
                        <div className="table-head">
                          <span>Reward Type</span>
                          <span>Reward / Amount (₹)</span>
                          <span>Action</span>
                        </div>
                        {milestone.rewardOptions?.map((reward, rewardIdx) => (
                          <>
                            <div key={reward._id} className="table-row">
                              <span>
                                {" "}
                                <select
                                  value={reward.type}
                                  onChange={(e) =>
                                    updateReward_(index, rewardIdx, {
                                      type: e.target.value,
                                    })
                                  }
                                >
                                  <option value="cash">Cash</option>
                                  <option value="reward">Reward</option>
                                </select>
                              </span>
                              <span>
                                {reward.type === "reward" ? (
                                  <input
                                    type="text"
                                    placeholder="Samsung TV"
                                    value={reward.title || ""}
                                    onChange={(e) =>
                                      updateReward_(index, rewardIdx, {
                                        title: e.target.value,
                                      })
                                    }
                                  />
                                ) : (
                                  <input
                                    type="number"
                                    placeholder="10000"
                                    value={reward.value || ""}
                                    onChange={(e) =>
                                      updateReward_(index, rewardIdx, {
                                        value: Number(e.target.value),
                                      })
                                    }
                                  />
                                )}
                              </span>
                              <span><div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                }}
                              >
                                {milestone.rewardOptions.length > 1 && (
                                  <div className=" dots">
                                    <span
                                      onClick={() =>
                                        removeReward(index, rewardIdx)
                                      }
                                    >
                                      <NiDelete />
                                    </span>
                                  </div>
                                )}
                              </div></span>
                            </div>
                            {rewardIdx ===
                              milestone.rewardOptions.length - 1 && (
                                <div className="modal-actions">
                                  <button
                                    className="add-button"
                                    type="button"
                                    onClick={() => addReward(index)}
                                    style={{
                                      background: "#198754",
                                      // color: "#fff",
                                      border: "none",
                                      // padding: "6px 12px",
                                      // borderRadius: 5,
                                      // cursor: "pointer",
                                    }}
                                  >
                                    <LuPlus /> Add More Rewards
                                  </button>
                                </div>
                              )}
                          </>
                        ))}
                      </div>
                    </div>

                    {(!milestone.rewardOptions ||
                      milestone.rewardOptions.length === 0) && (
                        <div style={{ padding: 15 }}>
                          <button
                            className="add-button"
                            type="button"
                            onClick={() => addReward(index)}
                            style={{
                              background: "#198754",
                              color: "#fff",
                              border: "none",
                              padding: "8px 15px",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          >
                            <LuPlus /> Add Reward
                          </button>
                        </div>
                      )}
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={addMilestone}
                style={{
                  background: "#0d6efd",
                  border: "none",
                  margin: "1rem 0"
                }}
              >
                <LuPlus /> Add Milestone
              </button>
            </div>
          </>
        )}

        {/* DISCOUNT */}

        {/* {tab === "discounts" && (
          <>
            <div className="field">
              <label>Discount</label>
              <input
                type="number"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label>Type</label>
              <select
                value={formData.type || ""}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>

            <div className="field">
              <label>Terms</label>
              <textarea
                value={formData.terms || ""}
                onChange={(e) =>
                  setFormData({ ...formData, terms: e.target.value })
                }
              />
            </div>
          </>
        )} */}

        <div className="modal-actions">
          <button disabled={saving} onClick={handleSubmit}>
            {isEditMode ? "Update" : "Add"}
          </button>
        </div>
      </AddLocationModal>
    </div>
  );
};

export default OffersDiscounts;
