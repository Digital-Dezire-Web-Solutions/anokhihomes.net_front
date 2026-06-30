import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPlotsetting } from "../../Redux/Slices/AppSlices";
import Host from "../../Host/Host";
import axios from "axios";

const PlotHoldSetting = ({ setAlert }) => {
    const dispatch = useDispatch();
    const { userDetail, plotSetting } = useSelector((state) => state.app);
    const[saving, setSaving] = useState(false)

    useEffect(() => {
        dispatch(getPlotsetting());
    }, []);

    const [config, setConfig] = useState({
    });
    useEffect(() => {
        if (plotSetting) {
            setConfig({
                freeHoldDays: plotSetting.freeHoldDays,
                paidHoldDays: plotSetting.paidHoldDays,
                paidAmount: plotSetting.paidAmount,
            });
        }
    }, [plotSetting]);

    const updatePlotHoldSetting = async () => {
        setSaving(true)
        try {
            const token = localStorage.getItem("token");
            
            await axios.put(
                `${Host}/api/plothold/settings`,
                {
                    freeHoldDays: config.freeHoldDays,
                    paidHoldDays: config.paidHoldDays,
                    paidAmount: config.paidAmount,
                },
                {
                    headers: {
                        "auth-token": token,
                    },
                }
            );
            dispatch(getPlotsetting());
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
    return (
        <div className="admin-config-box">
            <div>
                <h4>Shadow Hold Settings</h4>
                <div className="admin-config card">
                    <div className="field">
                        <label>Token Amount</label>
                        <input
                            type="type"
                            value="Free"
                            readOnly
                        // onChange={(e) =>
                        //     setConfig({
                        //         ...config,
                        //         tdsPercent: Number(e.target.value),
                        //     })
                        // }
                        />
                    </div>
                    <div className="field">
                        <label>Hold Days</label>
                        <input
                            type="number"
                            value={config?.freeHoldDays}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    freeHoldDays: Number(e.target.value),
                                })
                            }
                        />
                    </div>
                    <div className="modal-actions">
                        <button
                            className="btn primary"
                            disabled={saving}
                            onClick={updatePlotHoldSetting}
                        >
                            {saving ? "Updating" : "Update"}
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <h4>Token Hold Settings</h4>
                <div className="admin-config card">
                    <div className="field">
                        <label>Token Amount</label>
                        <input
                            type="type"
                            value={config?.paidAmount}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    paidAmount: Number(e.target.value),
                                })
                            }
                        />
                    </div>
                    <div className="field">
                        <label>Hold Days</label>
                        <input
                            type="number"
                            value={config?.paidHoldDays}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    paidHoldDays: Number(e.target.value),
                                })
                            }
                        />
                    </div>
                    <div className="modal-actions">
                        <button
                        disabled={saving}
                            className="btn primary"
                            onClick={updatePlotHoldSetting}
                        >
                            {saving ? "Updating" : "Update"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlotHoldSetting;
