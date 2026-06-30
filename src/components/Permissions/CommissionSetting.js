import React, { useEffect, useState } from "react";
import { getPayoutSettings, getRank } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Host from "../../Host/Host";

const CommissionSetting = ({ setAlert }) => {
    const dispatch = useDispatch();
    const [saving, setSaving] = useState(false)
    const { rankData, payoutSettings } = useSelector((state) => state.app);
    useEffect(() => {
        dispatch(getRank());
        dispatch(getPayoutSettings());
    }, [dispatch]);
    const [config, setConfig] = useState({
        tdsPercent: 2,
        adminChargePercent: 5,
    });
    useEffect(() => {
        if (payoutSettings) {
            setConfig({
                tdsPercent: payoutSettings.tdsPercent || 2,
                adminChargePercent:
                    payoutSettings.adminChargePercent || 5,
            });
        }
    }, [payoutSettings]);

    const updateCommissionSetting = async () => {
        setSaving(true)
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `${Host}/api/payout-settings`,
                {
                    tdsPercent: config.tdsPercent,
                    adminChargePercent:
                        config.adminChargePercent,
                },
                {
                    headers: {
                        "auth-token": token,
                    },
                }
            );

            dispatch(getPayoutSettings());

            setAlert({
                status: "Success",
                message: "Settings Updated Successfully",
            });

            setTimeout(() => setAlert(null), 3000);
            setSaving(false)
        } catch (err) {
            console.log(err);

            setAlert({
                status: "Error",
                message:
                    err.response?.data?.message ||
                    "Unable to update settings",
            });

            setTimeout(() => setAlert(null), 3000);
            setSaving(false)
        }
    };

    const [levels, setLevels] = useState([]);

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
                            {/* <span>Level</span> */}
                            <span>Min</span>
                            <span>Max</span>
                            <span>%</span>
                            <span>Designation</span>
                        </div>

                        {rankData.map((lvl, i) => (
                            <div key={i} className="level-row">
                                {/* <input
                                    value={lvl.level}
                                    onChange={(e) => {
                                        const updated = [...levels];
                                        updated[i].level = +e.target.value;
                                        setLevels(updated);
                                    }}
                                /> */}
                                <input
                                    value={lvl.min}
                                    onChange={(e) => {
                                        const updated = [...levels];
                                        updated[i].min = +e.target.value;
                                        setLevels(updated);
                                    }}
                                />

                                <input
                                    value={lvl.max}
                                    onChange={(e) => {
                                        const updated = [...levels];
                                        updated[i].max = +e.target.value;
                                        setLevels(updated);
                                    }}
                                />

                                <input
                                    value={lvl.directIncome}
                                    onChange={(e) => {
                                        const updated = [...levels];
                                        updated[i].directIncome = +e.target.value;
                                        setLevels(updated);
                                    }}
                                />

                                <input
                                    value={lvl.designation}
                                    onChange={(e) => {
                                        const updated = [...levels];
                                        updated[i].designation = e.target.value;
                                        setLevels(updated);
                                    }}
                                />

                            </div>
                        ))}
                        {/* <div className="modal-actions">
                            <button
                                className="btn primary"
                                onClick={() => {
                                    setAlert({ message: "Commission settings updated successfully!", status: "Success" });
                                    setTimeout(() => {
                                        setAlert(null);
                                    }, 5000);
                                }}>
                                Update
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionSetting;
