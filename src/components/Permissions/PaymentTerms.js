import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getPaymentTerms,
  createPaymentTerms,
  updatePaymentTerms,
  deletePaymentTerms,
} from "../../Redux/Slices/AppSlices";
import NiDelete from "../../icons/ni-delete";

const PaymentTerms = ({ setAlert }) => {
  const dispatch = useDispatch();

  const { paymentTerms } = useSelector((state) => state.app);

  const [form, setForm] = useState({
    bookingDays: [],
    agreementDays: [],
    fullPaymentDays: [],
  });

  useEffect(() => {
    dispatch(getPaymentTerms());
  }, []);

  useEffect(() => {
    if (paymentTerms) {
      setForm(paymentTerms);
    }
  }, [paymentTerms]);

  const addValue = (field) => {
    setForm({
      ...form,
      [field]: [...form[field], ""],
    });
  };

  const updateValue = (field, index, value) => {
    const arr = [...form[field]];
    arr[index] = Number(value);

    setForm({
      ...form,
      [field]: arr,
    });
  };

  const removeValue = (field, index) => {
    const arr = [...form[field]];
    arr.splice(index, 1);

    setForm({
      ...form,
      [field]: arr,
    });
  };

  const save = async () => {
    if (paymentTerms?._id) {
      await dispatch(
        updatePaymentTerms({
          id: paymentTerms._id,
          data: form,
        }),
      );
    } else {
      await dispatch(createPaymentTerms(form));
    }

    dispatch(getPaymentTerms());

    setAlert({
      message: "Payment terms updated",
      status: "Success",
    });

    setTimeout(() => setAlert(null), 3000);
  };

  const renderSection = (title, field) => (
    <div>
      <h4>{title}</h4>
      <div className="admin-config-box card">
        {form[field]?.map((day, index) => (
          <div
            className="field"
            key={index}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <input
              type="number"
              value={day}
              onChange={(e) => updateValue(field, index, e.target.value)}
            />

            <span type="button" onClick={() => removeValue(field, index)}>
              <NiDelete />
            </span>
          </div>
        ))}

        <button
          className="btn primary"
          type="button"
          onClick={() => addValue(field)}
        >
          + Add Day
        </button>
      </div>
    </div>
  );

  return (
    <>
      <h4>Payment Terms</h4>

      {renderSection("Booking Payment Days", "bookingDays")}

      {renderSection("Agreement Payment Days", "agreementDays")}

      {renderSection("Full Payment Days", "fullPaymentDays")}

      <button className="btn primary" onClick={save}>
        Save
      </button>

      {/* {paymentTerms && (
        <button
          className="btn primary"
          onClick={() => dispatch(deletePaymentTerms(paymentTerms._id))}
        >
          Delete Payment Terms
        </button>
      )} */}
    </>
  );
};

export default PaymentTerms;
