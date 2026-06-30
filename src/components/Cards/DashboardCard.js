const DashboardCard = ({ title, value, icons }) => {
  return (
    <div className="dashboard-card dashboard-box-item card">
      <div className="dashboard-card-left dashboard-box-item-left">
        {icons}
      </div>
      <div className="dashboard-card-right dashboard-box-item-right">
        <h4>{title}</h4>
        <h2>{value}</h2>
      </div>
    </div>
  );
};

export default DashboardCard
