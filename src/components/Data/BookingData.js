const BookingData = [
  {
    id: 1,
    customerId: "Rahul",
    agentId: "Associate1",
    plot: "A-12, Rajgir-colony, Bihar",

    totalAmount: 1200000,
    amountPaid: 120000,

    status: "Pending",

    paymentSchedule: {
      booking: {
        percent: 10,
        amount: 120000,
        paid: true,
        date: "2026-04-01",
      },

      agreement: {
        percent: 25,
        amount: 300000,
        dueDays: 30,
        paid: true,
        date: "2026-05-20",
      },

      full: {
        percent: 65,
        amount: 780000,
        dueDays: 90,
        paid: false,
        date: "2026-06-20",
      },
    },
  },

  {
    id: 2,
    customerId: "Irfan",
    agentId: "Associate2",
    plot: "B-5, Rajgir-colony, Bihar",

    totalAmount: 850000,
    amountPaid: 0,

    status: "Pending",

    paymentSchedule: {
      booking: {
        percent: 10,
        amount: 85000,
        paid: false,
        date: null,
      },

      agreement: {
        percent: 25,
        amount: 212500,
        dueDays: 30,
        paid: false,
        date: null,
      },

      full: {
        percent: 65,
        amount: 552500,
        dueDays: 90,
        paid: false,
        date: null,
      },
    },
  },

  {
    id: 3,
    customerId: "Safiya",
    agentId: "Associate3",
    plot: "C-8, Mumbai-colony, Mumbai",

    totalAmount: 1000000,
    amountPaid: 40000,

    status: "Rejected",

    paymentSchedule: {
      booking: {
        percent: 10,
        amount: 100000,
        paid: false,
        date: null,
      },

      agreement: {
        percent: 25,
        amount: 250000,
        dueDays: 30,
        paid: false,
        date: null,
      },

      full: {
        percent: 65,
        amount: 650000,
        dueDays: 90,
        paid: false,
        date: null,
      },
    },
  },
  {
    id: 4,
    customerId: "Amit",
    agentId: "Associate4",
    plot: "D-10, Rajgir-colony, Bihar",

    totalAmount: 1500000,
    amountPaid: 1500000,

    status: "Confirmed",

    paymentSchedule: {
      booking: {
        percent: 10,
        amount: 150000,
        paid: true,
        date: "2026-02-10",
      },

      agreement: {
        percent: 25,
        amount: 375000,
        dueDays: 30,
        paid: true,
        date: "2026-03-05",
      },

      full: {
        percent: 65,
        amount: 975000,
        dueDays: 90,
        paid: true,
        date: "2026-04-05",
      },
    },
  },
  {
    id: 5,
    customerId: "Shanaya",
    agentId: "Associate5",
    plot: "D-10, Rajgir-colony, Bihar",
    area:"1200 sqft",

    totalAmount: 1500000,
    amountPaid: 0,

    status: "Approval",
    amountRequested: 500,
    pricePerSqft: 700,
    paymentSchedule: {
      booking: {
        percent: 10,
        amount: 0,
        paid: false,
        date: "2026-05-10",
      },

      agreement: {
        percent: 25,
        amount: 0,
        dueDays: 30,
        paid: false,
        date: "2026-03-05",
      },

      full: {
        percent: 65,
        amount: 0,
        dueDays: 90,
        paid: false,
        date: "2026-04-05",
      },
    },
  },
];

export default BookingData;
