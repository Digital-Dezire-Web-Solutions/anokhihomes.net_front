import React, { useEffect, useState } from "react";
import { getPayoutSettings, getRank } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Host from "../../Host/Host";

const CommissionSetting = ({ setAlert }) => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const { rankData, payoutSettings } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(getRank());
    dispatch(getPayoutSettings());
  }, [dispatch]);
  const [config, setConfig] = useState({
    tdsPercent: 2,
    adminChargePercent: 5,
    joiningCharge: 999,
  });
  useEffect(() => {
    if (payoutSettings) {
      setConfig({
        tdsPercent: payoutSettings.tdsPercent || 2,
        adminChargePercent: payoutSettings.adminChargePercent || 5,
        joiningCharge: payoutSettings.joiningCharge || 999,
      });
    }
  }, [payoutSettings]);

  const updateCommissionSetting = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${Host}/api/payout-settings`,
        {
          tdsPercent: config.tdsPercent,
          adminChargePercent: config.adminChargePercent,
          joiningCharge: config.joiningCharge,
        },
        {
          headers: {
            "auth-token": token,
          },
        },
      );

      dispatch(getPayoutSettings());

      setAlert({
        status: "Success",
        message: "Settings Updated Successfully",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (err) {
      console.log(err);

      setAlert({
        status: "Error",
        message: err.response?.data?.message || "Unable to update settings",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    }
  };

  const [levels, setLevels] = useState([]);

  useEffect(() => {
    if (rankData?.length) {
      setLevels(
        rankData.map((rank) => ({
          _id: rank._id,
          level: rank.level,
          designation: rank.designation,
          min: rank.min,
          max: rank.max,
          directIncome: rank.directIncome,
        })),
      );
    }
  }, [rankData]);

  const updateRankSlabs = async () => {
  try {
    setSaving(true);

    const token = localStorage.getItem("token");

    for (const rank of levels) {
      await axios.put(
        `${Host}/api/auth/update-rank-slab/${rank.level}`,
        {
          min: Number(rank.min),
          max:
            rank.max === "" ||
            rank.max === null ||
            rank.max === "Infinity"
              ? "Infinity"
              : Number(rank.max),
          directIncome: Number(rank.directIncome),
          designation: rank.designation,
        },
        {
          headers: {
            "auth-token": token,
          },
        },
      );
    }

    await dispatch(getRank());

    setAlert({
      status: "Success",
      message: "Rank slabs updated successfully",
    });

    setTimeout(() => setAlert(null), 3000);
  } catch (err) {
    console.log(err);

    setAlert({
      status: "Error",
      message:
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        "Unable to update rank slabs",
    });

    setTimeout(() => setAlert(null), 3000);
  } finally {
    setSaving(false);
  }
};

  return (
    <div>
      <div className="admin-config-box">
        <div>
          <h4>Commission Settings</h4>
          <div className="admin-config card">
            <div className="field">
              <label>TDS %</label>
              <input
                type="number"
                value={config.tdsPercent}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    tdsPercent: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="field">
              <label>Admin Charge %</label>
              <input
                type="number"
                value={config.adminChargePercent}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    adminChargePercent: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="field">
              <label>Joining Fee</label>
              <input
                type="number"
                value={config.joiningCharge}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    joiningCharge: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="modal-actions">
              <button
                disabled={saving}
                className="btn primary"
                onClick={updateCommissionSetting}
              >
                Update
              </button>
            </div>
          </div>
        </div>
        <div>
          <h4>Commission Levels</h4>

          <div className="levels-config card">
            <div className="level-head">
              <span>Min</span>
              <span>Max</span>
              <span>%</span>
              <span>Designation</span>
            </div>

            {levels.map((lvl, i) => (
              <div key={lvl._id || lvl.level} className="level-row">
                {/* MIN */}
                <input
                  type="number"
                  value={lvl.min}
                  onChange={(e) => {
                    const updated = [...levels];

                    updated[i] = {
                      ...updated[i],
                      min: Number(e.target.value),
                    };

                    setLevels(updated);
                  }}
                />

                {/* MAX */}
                <input
                  type="number"
                  value={lvl.max === Infinity ? "" : lvl.max}
                  onChange={(e) => {
                    const updated = [...levels];

                    updated[i] = {
                      ...updated[i],
                      max: Number(e.target.value),
                    };

                    setLevels(updated);
                  }}
                />

                {/* DIRECT INCOME */}
                <input
                  type="number"
                  value={lvl.directIncome}
                  onChange={(e) => {
                    const updated = [...levels];

                    updated[i] = {
                      ...updated[i],
                      directIncome: Number(e.target.value),
                    };

                    setLevels(updated);
                  }}
                />

                {/* DESIGNATION */}
                <input
                  type="text"
                  value={lvl.designation}
                  onChange={(e) => {
                    const updated = [...levels];

                    updated[i] = {
                      ...updated[i],
                      designation: e.target.value,
                    };

                    setLevels(updated);
                  }}
                />
              </div>
            ))}

            <div className="modal-actions">
              <button
                className="btn primary"
                disabled={saving}
                onClick={updateRankSlabs}
              >
                {saving ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionSetting;
