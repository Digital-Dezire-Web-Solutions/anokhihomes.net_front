// export const formatCurrency = (amount) => {
//   if (amount === null || amount === undefined || amount === "") return "0";

//   return Number(amount).toLocaleString("en-IN");
// };

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "0";

  return Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};