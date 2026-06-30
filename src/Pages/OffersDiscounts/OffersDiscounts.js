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
} from "../../Redux/Slices/AppSlices";
import RoyaltyCard from "../../components/Cards/RoyaltyCard";
import SearchSelect from "../../components/SearchItems/SearchSelect";
import CashbackCard from "../../components/Cards/CashbackCard";

const ITEMS_PER_PAGE = 18;

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
  } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(getAccountDetails());
  }, []);
  const [tab, setTab] = useState("offers");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [selectedOffers, setSelectedOffers] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState(null);

  const [formData, setFormData] = useState({});
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
      let offers = offersData || [];

      if (mood !== "admin" && mood !== "staff") {
        offers = offers.filter(
          (d) => d.userType?.includes(mood) && d.status === "active",
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

  const paginated = filtered?.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  /* ---------- SAVE ---------- */

  const handleSubmit = async () => {
    setSaving(true)
    try {
      let response;

      if (tab === "offers") {
        response = isEditMode
          ? await dispatch(
            updateOffer({
              id: formData._id,
              data: formData,
            }),
          )
          : await dispatch(addOffer(formData));
      }

      if (tab === "discounts") {
        response = isEditMode
          ? await dispatch(
            updateDiscount({
              id: formData._id,
              data: formData,
            }),
          )
          : await dispatch(addDiscount(formData));
      }

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
      dispatch(getDiscount());
      dispatch(getRewards());
      dispatch(getCashback());

      setSaving(false)
      setOpen(false);
    } catch (error) {
      setAlert({
        message: "Something went wrong",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    }
  };

  const handleDelete = async (id) => {
    setSaving(true)
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
      setSaving(false)
    } catch (error) {
      setAlert({
        message: "Delete Failed",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    }
  };

  const handleToggleStatus = async (item) => {
    setSaving(true)
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
      setSaving(false)
    } catch (error) {
      console.log(error);
      setSaving(false)
    }
  };

  const handleClaimCash = async (id) => {
    setSaving(true)
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
      setSaving(false)
    } catch (error) {
      setAlert({
        message: error?.msg || "Failed",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    }
  };

  const handleClaimGift = async (id) => {
    setSaving(true)
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
      setSaving(false)
    } catch (error) {
      setAlert({
        message: error?.msg || "Failed",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    }
  };
  // console.log(selectedProjects, "selectedProjects");
  console.log(offersData, "offersData");

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
              Festival Offers &Bonanza
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

        {(tab === "offers" || tab === "discounts") &&
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
        {(tab === "offers" || tab === "discounts") && (
          <>
            <div className="field">
              <label>Title</label>
              <input
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* DESCRIPTION */}

            <div className="field">
              <label>Description</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
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
            {/* <div className="field">
              <label>Applicable Colonies</label>

              <select
                multiple
                value={formData.colonies || []}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colonies: Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    ),
                  })
                }
              >
                {allColonies?.map((colony) => (
                  <option key={colony._id} value={colony._id}>
                    {colony.name}
                  </option>
                ))}
              </select>

              <small>Hold Ctrl (Windows) / Cmd (Mac) to select multiple colonies.</small>
            </div> */}
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
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>Offer Type</label>

              <select
                value={formData.offerType || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    offerType: e.target.value,
                  })
                }
              >
                <option value="">Select Type</option>
                <option value="item">Free Item</option>
                <option value="amount">Flat Amount</option>
                <option value="percent">Percentage</option>
              </select>
            </div>
            {formData.offerType === "item" && (
              <div className="field">
                <label>Item Name</label>

                <input
                  placeholder="Ex. Modular Kitchen"
                  value={formData.offerValue || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      offerValue: e.target.value,
                    })
                  }
                />
              </div>
            )}
            {formData.offerType === "amount" && (
              <div className="field">
                <label>Discount Amount</label>

                <input
                  type="number"
                  placeholder="₹50000"
                  value={formData.offerValue || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      offerValue: Number(e.target.value),
                    })
                  }
                />
              </div>
            )}
            {formData.offerType === "percent" && (
              <div className="field">
                <label>Discount Percentage</label>

                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="10"
                  value={formData.offerValue || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      offerValue: Number(e.target.value),
                    })
                  }
                />
              </div>
            )}
            <div className="field">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </>
        )}
        {tab === "targets" && (
          <>
            <div className="field">
              <label>Target Business</label>
              <input
                type="number"
                value={formData.targetBusiness || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetBusiness: e.target.value,
                  })
                }
              />
            </div>

            <div className="field">
              <label>Reward Cash</label>
              <input
                type="number"
                value={formData.rewardCash || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rewardCash: e.target.value,
                  })
                }
              />
            </div>

            <div className="field">
              <label>Reward Name</label>
              <input
                value={formData.rewardName || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rewardName: e.target.value,
                  })
                }
              />
            </div>

            <div className="field">
              <label>Royalty %</label>
              <input
                type="number"
                value={formData.royaltyPercent || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    royaltyPercent: e.target.value,
                  })
                }
              />
            </div>
          </>
        )}

        {tab === "offers" && (
          <div className="field">
            <label>User Type</label>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.userType?.includes("user") || false}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...(formData.userType || []), "user"]
                      : formData.userType.filter((t) => t !== "user");

                    setFormData({ ...formData, userType: updated });
                  }}
                />
                User
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={formData.userType?.includes("agent") || false}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...(formData.userType || []), "agent"]
                      : formData.userType.filter((t) => t !== "agent");

                    setFormData({ ...formData, userType: updated });
                  }}
                />
                Agent
              </label>
            </div>
          </div>
        )}

        {/* OFFER */}

        {/* {tab === "offers" && (
          <div className="field">
            <label>Price Value</label>
            <input
              type="number"
              value={formData.priceValue || ""}
              onChange={(e) =>
                setFormData({ ...formData, priceValue: e.target.value })
              }
            />
          </div>
        )} */}

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
