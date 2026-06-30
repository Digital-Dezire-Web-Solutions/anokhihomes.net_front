import NiDownload from "../../icons/ni-download";
import downloadReceipt from "../Utils/downloadReceipt";
import Host from "../../Host/Host";
import ViewModal from "../Modals/ViewModal";

const ReceiptModal = ({ open, onClose, paymentId }) => {
  const token = localStorage.getItem("token");
  const [saving, setSaving] = usestate(false);
  return (
    <ViewModal open={open} onClose={onClose} title="Payment Receipt">
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 15,
        }}
      >
        <button
          className="view-report-btn"
          onClick={() => {
            downloadReceipt(paymentId);
            setSaving(true);
            setTimeout(() => {
              setSaving(false);
            }, 3000);
          }}
          disabled={saving}
        >
          <NiDownload />
          Download
        </button>
      </div>

      <iframe
        title="Receipt"
        src={`${Host}/api/payment/receipt/${paymentId}?token=${token}`}
        width="100%"
        height="700px"
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
        }}
      />
    </ViewModal>
  );
};

export default ReceiptModal;
