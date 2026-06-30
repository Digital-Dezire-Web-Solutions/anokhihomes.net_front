import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Host from "../../Host/Host";

// Helper
const getToken = () => localStorage.getItem("token");

// ========================
// 🔥 Async Thunks
// ========================

export const getAccountDetails = createAsyncThunk(
  "app/getAccountDetails",
  async () => {
    const res = await fetch(`${Host}/api/auth/getuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });
    return res.json();
  },
);

export const getUserRole = createAsyncThunk("app/getUserRole", async (role) => {
  const res = await fetch(`${Host}/api/auth/role/${role}`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });
  return res.json();
});

export const getUser = createAsyncThunk("app/getUser", async () => {
  const res = await fetch(`${Host}/api/auth/all-users`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });
  return res.json();
});
export const getUserById = createAsyncThunk("app/getUserById", async (id) => {
  const res = await fetch(`${Host}/api/auth/user/${id}`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });
  return res.json();
});
export const getRank = createAsyncThunk("app/ranks", async () => {
  const res = await fetch(`${Host}/api/auth/ranks`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });
  return res.json();
});

export const addUser = createAsyncThunk(
  "app/addUser",
  async (data, { rejectWithValue }) => {
    try {
      const res = await fetch(`${Host}/api/auth/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": getToken(),
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return rejectWithValue(result);
      }

      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateUserApproval = createAsyncThunk(
  "app/updateUserApproval",
  async ({ id, status }) => {
    const res = await fetch(`${Host}/api/auth/approval/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
      body: JSON.stringify({ status }),
    });

    return await res.json();
  },
);

export const updateUserStatus = createAsyncThunk(
  "app/updateUserStatus",
  async ({ id, status }) => {
    const res = await fetch(`${Host}/api/auth/status/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
      body: JSON.stringify({ status }),
    });

    return await res.json();
  },
);

export const updateUser = createAsyncThunk(
  "app/updateUser",
  async ({ id, data }) => {
    const res = await fetch(`${Host}/api/auth/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  },
);

export const deleteUser = createAsyncThunk("app/deleteUser", async (id) => {
  const res = await fetch(`${Host}/api/auth/delete/${id}`, {
    method: "DELETE",
    headers: {
      "auth-token": getToken(),
    },
  });

  return {
    id,
    ...(await res.json()),
  };
});

export const getLeads = createAsyncThunk("app/getLeads", async () => {
  const res = await fetch(`${Host}/api/lead`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });
  return res.json();
});

export const getSiteVisit = createAsyncThunk("app/getSiteVisit", async () => {
  const res = await fetch(`${Host}/api/sitevisit`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });
  return res.json();
});

export const getBooking = createAsyncThunk("app/getBooking", async () => {
  const res = await fetch(`${Host}/api/booking`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });
  return res.json();
});

export const getPayments = createAsyncThunk("app/getPayments", async () => {
  const res = await fetch(`${Host}/api/payment`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });
  return res.json();
});

export const getLocation = createAsyncThunk("app/getLocation", async () => {
  const res = await fetch(`${Host}/api/location`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });
  return res.json();
});

export const getAllColonies = createAsyncThunk(
  "app/getAllColonies",
  async (locationId) => {
    const res = await fetch(`${Host}/api/colony`, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });
    return res.json();
  },
);
export const getProjects = createAsyncThunk(
  "app/getProjects",
  async (locationId) => {
    const res = await fetch(`${Host}/api/colony/location/${locationId}`, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });
    return res.json();
  },
);

export const getPlots = createAsyncThunk("app/getPlots", async (locationId) => {
  const res = await fetch(`${Host}/api/plot/${locationId}`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });
  return res.json();
});

export const getLandingPage = createAsyncThunk(
  "app/getLandingPage",
  async () => {
    const res = await fetch(`${Host}/api/landing`, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });
    return res.json();
  },
);
export const getAgentByReferralId = createAsyncThunk(
  "app/getAgentByReferralId",
  async (referralId) => {
    const res = await fetch(`${Host}/api/auth/referral/${referralId}`, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });
    return res.json();
  },
);

export const getTeamTree = createAsyncThunk(
  "app/getTeamTree",
  async (referralId) => {
    const res = await fetch(`${Host}/api/auth/team-tree/${referralId}`, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });

    return res.json();
  },
);
export const getIncome = createAsyncThunk("app/getIncome", async () => {
  const res = await fetch(`${Host}/api/auth/income-history`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });

  return res.json();
});
export const getIncomeSummary = createAsyncThunk(
  "app/getIncomeSummary",
  async () => {
    const res = await fetch(`${Host}/api/wallet/commission/summary`, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });

    return res.json();
  },
);

export const getRoyaltyUsers = createAsyncThunk(
  "app/getRoyaltyUsers",
  async () => {
    const res = await fetch(`${Host}/api/rewards/royalty-users`, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });
    return await res.json();
  },
);
export const getMyRewards = createAsyncThunk(
  "app/getMyRewards",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${Host}/api/rewards/my-rewards`, {
        headers: {
          "auth-token": getToken(),
        },
      });

      return await res.json();
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const claimRewardCash = createAsyncThunk(
  "app/claimRewardCash",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${Host}/api/rewards/claim-cash/${id}`, {
        method: "PUT",
        headers: {
          "auth-token": getToken(),
        },
      });

      return await res.json();
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const claimRewardGift = createAsyncThunk(
  "app/claimRewardGift",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${Host}/api/rewards/claim-reward/${id}`, {
        method: "PUT",
        headers: {
          "auth-token": getToken(),
        },
      });

      return await res.json();
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const getRewards = createAsyncThunk("app/getRewards", async () => {
  const res = await fetch(`${Host}/api/rewards`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });

  return res.json();
});

export const updateReward = createAsyncThunk(
  "app/updateReward",
  async ({ id, data }) => {
    const res = await fetch(`${Host}/api/rewards/edit/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  },
);

export const getOffers = createAsyncThunk("app/getOffers", async () => {
  const res = await fetch(`${Host}/api/offer`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });

  return res.json();
});

export const addOffer = createAsyncThunk("app/addOffer", async (data) => {
  const res = await fetch(`${Host}/api/offer/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
    body: JSON.stringify(data),
  });

  return await res.json();
});

export const updateOffer = createAsyncThunk(
  "app/updateOffer",
  async ({ id, data }) => {
    console.log(data, "iddata");
    const res = await fetch(`${Host}/api/offer/edit/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  },
);

export const deleteOffer = createAsyncThunk("app/deleteOffer", async (id) => {
  const res = await fetch(`${Host}/api/offer/delete/${id}`, {
    method: "DELETE",
    headers: {
      "auth-token": getToken(),
    },
  });

  return await res.json();
});

export const toggleOfferStatus = createAsyncThunk(
  "app/toggleOffer",
  async (id) => {
    const res = await fetch(`${Host}/api/offer/toggle/${id}`, {
      method: "PUT",
      headers: {
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);

export const getDiscount = createAsyncThunk("app/getDiscount", async () => {
  const res = await fetch(`${Host}/api/discount`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });

  return res.json();
});

export const addDiscount = createAsyncThunk("app/addDiscount", async (data) => {
  const res = await fetch(`${Host}/api/discount/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
    body: JSON.stringify(data),
  });

  return await res.json();
});

export const updateDiscount = createAsyncThunk(
  "app/updateDiscount",
  async ({ id, data }) => {
    const res = await fetch(`${Host}/api/discount/edit/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  },
);

export const deleteDiscount = createAsyncThunk(
  "app/deleteDiscount",
  async (id) => {
    const res = await fetch(`${Host}/api/discount/delete/${id}`, {
      method: "DELETE",
      headers: {
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);

export const toggleDiscountStatus = createAsyncThunk(
  "app/toggleDiscount",
  async (id) => {
    const res = await fetch(`${Host}/api/discount/toggle/${id}`, {
      method: "PUT",
      headers: {
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);
export const getCashback = createAsyncThunk("app/getCashback", async () => {
  const res = await fetch(`${Host}/api/cashback`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });

  return res.json();
});

export const addCashback = createAsyncThunk("app/addCashback", async (data) => {
  const res = await fetch(`${Host}/api/cashback/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
    body: JSON.stringify(data),
  });

  return await res.json();
});

export const updateCashback = createAsyncThunk(
  "app/updateCashback",
  async ({ id, data }) => {
    const res = await fetch(`${Host}/api/cashback/edit/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  },
);

export const deleteCashback = createAsyncThunk(
  "app/deleteCashback",
  async (id) => {
    const res = await fetch(`${Host}/api/cashback/delete/${id}`, {
      method: "DELETE",
      headers: {
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);

export const toggleCashbackStatus = createAsyncThunk(
  "app/toggleCashback",
  async (id) => {
    const res = await fetch(`${Host}/api/cashback/toggle/${id}`, {
      method: "PUT",
      headers: {
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);

// ================= HELP CENTER =================

export const getHelpTickets = createAsyncThunk(
  "app/getHelpTickets",
  async () => {
    const res = await fetch(`${Host}/api/help`, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);

export const createHelpTicket = createAsyncThunk(
  "app/createHelpTicket",
  async (data) => {
    const res = await fetch(`${Host}/api/help/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  },
);

export const replyHelpTicket = createAsyncThunk(
  "app/replyHelpTicket",
  async ({ id, data }) => {
    const res = await fetch(`${Host}/api/help/reply/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  },
);

export const closeHelpTicket = createAsyncThunk(
  "app/closeHelpTicket",
  async (id) => {
    const res = await fetch(`${Host}/api/help/close/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);

export const deleteHelpTicket = createAsyncThunk(
  "app/deleteHelpTicket",
  async (id) => {
    const res = await fetch(`${Host}/api/help/${id}`, {
      method: "DELETE",
      headers: {
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);

export const getPaymentTerms = createAsyncThunk(
  "app/getPaymentTerms",
  async () => {
    const res = await fetch(`${Host}/api/payment-terms`, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);

export const updatePaymentTerms = createAsyncThunk(
  "app/updatePaymentTerms",
  async ({ id, data }) => {
    const res = await fetch(`${Host}/api/payment-terms/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  },
);

export const createPaymentTerms = createAsyncThunk(
  "app/createPaymentTerms",
  async (data) => {
    const res = await fetch(`${Host}/api/payment-terms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  },
);

export const deletePaymentTerms = createAsyncThunk(
  "app/deletePaymentTerms",
  async (id) => {
    const res = await fetch(`${Host}/api/payment-terms/${id}`, {
      method: "DELETE",
      headers: {
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);

export const getPlotHold = createAsyncThunk("app/getPlotHold", async () => {
  const res = await fetch(`${Host}/api/plothold`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });

  return await res.json();
});

export const getPlotsetting = createAsyncThunk(
  "app/getPlotsetting",
  async () => {
    const res = await fetch(`${Host}/api/plothold/settings`, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);

export const getPayoutSettings = createAsyncThunk(
  "app/getPayoutSettings",
  async () => {
    const res = await fetch(`${Host}/api/payout-settings`, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);

export const updatePayoutSettings = createAsyncThunk(
  "app/updatePayoutSettings",
  async (data) => {
    const res = await fetch(`${Host}/api/payout-settings`, data, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
    });

    return res.data.setting;
  },
);

export const getRating = createAsyncThunk("app/getRating", async () => {
  const res = await fetch(`${Host}/api/rating`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });

  return await res.json();
});

export const getNotifications = createAsyncThunk(
  "app/getNotifications",
  async () => {
    const res = await fetch(`${Host}/api/notification`, {
      headers: {
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);
export const getNotificationsCount = createAsyncThunk(
  "app/getNotificationsCount",
  async () => {
    const res = await fetch(`${Host}/api/notification/count`, {
      headers: {
        "auth-token": getToken(),
      },
    });

    return await res.json();
  },
);

export const readNotification = createAsyncThunk(
  "app/readNotification",
  async (id) => {
    await fetch(`${Host}/api/notification/read/${id}`, {
      method: "PUT",
      headers: {
        "auth-token": getToken(),
      },
    });

    return id;
  },
);

export const getStaffRoles = createAsyncThunk("app/getStaffRoles", async () => {
  const res = await fetch(`${Host}/api/staff-role`, {
    headers: {
      "Content-Type": "application/json",
      "auth-token": getToken(),
    },
  });

  return await res.json();
});

export const updateStaffRole = createAsyncThunk(
  "app/updateStaffRole",
  async ({ id, permissions }) => {
    const res = await fetch(`${Host}/api/staff-role/edit/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": getToken(),
      },
      body: JSON.stringify({
        permissions,
      }),
    });

    return await res.json();
  },
);

export const addPayoutPayment = createAsyncThunk(
  "app/addPayoutPayment",
  async ({ payoutId, formData }) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${Host}/api/payout/pay/${payoutId}`, formData, {
      method: "PUT",
      headers: {
        token,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },
);

// ========================
// 🔥 Slice
// ========================

const appSlice = createSlice({
  name: "app",
  initialState: {
    userDetail: null,
    usersRole: [],
    users: [],
    userById: [],
    rankData: [],
    leads: [],
    siteVisit: [],
    booking: [],
    payment: [],
    location: null,
    allColonies: [],
    projects: [],
    plots: [],
    getLandingPage: [],
    agentByReferralId: [],
    myRewards: [],
    helpTickets: [],
    plotSetting: null,
    plotHold: [],
    ratingData: [],
    notifications: [],
    notificationsCount: [],
    staffRoles: [],
    paymentTerms: null,
    loading: false,
    error: null,
    payoutSettings: {
      tdsPercent: 2,
      adminChargePercent: 5,
    },
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      // USER
      .addCase(getAccountDetails.fulfilled, (state, action) => {
        state.userDetail = action.payload;
      })

      // All USER by role
      .addCase(getUserRole.fulfilled, (state, action) => {
        state.usersRole = action.payload;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.userById = action.payload;
      })

      // All USER
      .addCase(getUser.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(getRank.fulfilled, (state, action) => {
        state.rankData = action.payload;
      })

      // LEADS
      .addCase(getLeads.fulfilled, (state, action) => {
        state.leads = action.payload;
      })

      //   SITE VISIT
      .addCase(getSiteVisit.fulfilled, (state, action) => {
        state.siteVisit = action.payload;
      })

      //   BOOKING
      .addCase(getBooking.fulfilled, (state, action) => {
        state.booking = action.payload;
      })

      //   PAYMENTS
      .addCase(getPayments.fulfilled, (state, action) => {
        state.payment = action.payload;
      })

      // LOCATION
      .addCase(getLocation.fulfilled, (state, action) => {
        state.location = action.payload;
      })

      // PROJECTS ALL Colonies
      .addCase(getAllColonies.fulfilled, (state, action) => {
        state.allColonies = action.payload;
      })

      // PROJECTS
      .addCase(getProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
      })

      // PLOTS
      .addCase(getPlots.fulfilled, (state, action) => {
        state.plots = action.payload;
      })
      // getLandingPage
      .addCase(getLandingPage.fulfilled, (state, action) => {
        state.landingPage = action.payload;
      })

      .addCase(getAgentByReferralId.fulfilled, (state, action) => {
        state.agentByReferralId = action.payload;
      })

      .addCase(getTeamTree.fulfilled, (state, action) => {
        state.teamTree = action.payload;
      })
      .addCase(getIncome.fulfilled, (state, action) => {
        state.incomeHistory = action.payload;
      })
      .addCase(getIncomeSummary.fulfilled, (state, action) => {
        state.incomeSummary = action.payload;
      })
      .addCase(getRoyaltyUsers.fulfilled, (state, action) => {
        state.royaltyUsers = action.payload;
      })
      .addCase(getMyRewards.fulfilled, (state, action) => {
        state.myRewards = action.payload;
      })
      .addCase(getRewards.fulfilled, (state, action) => {
        state.rewards = action.payload;
      })
      .addCase(getOffers.fulfilled, (state, action) => {
        state.offersData = action.payload;
      })
      .addCase(getDiscount.fulfilled, (state, action) => {
        state.discountsData = action.payload;
      })
      .addCase(getCashback.fulfilled, (state, action) => {
        state.cashbackData = action.payload;
      })

      .addCase(getHelpTickets.fulfilled, (state, action) => {
        state.helpTickets = action.payload.tickets;
      })
      .addCase(getPaymentTerms.fulfilled, (state, action) => {
        state.paymentTerms = action.payload;
      })

      .addCase(updatePaymentTerms.fulfilled, (state, action) => {
        state.paymentTerms = action.payload.terms;
      })

      .addCase(createPaymentTerms.fulfilled, (state, action) => {
        state.paymentTerms = action.payload.terms;
      })

      .addCase(deletePaymentTerms.fulfilled, (state) => {
        state.paymentTerms = null;
      })

      .addCase(getPlotsetting.fulfilled, (state, action) => {
        state.plotSetting = action.payload;
      })
      .addCase(getPlotHold.fulfilled, (state, action) => {
        state.plotHold = action.payload;
      })

      .addCase(getPayoutSettings.fulfilled, (state, action) => {
        state.payoutSettings = action.payload;
      })

      .addCase(updatePayoutSettings.fulfilled, (state, action) => {
        state.payoutSettings = action.payload;
      })

      .addCase(getRating.fulfilled, (state, action) => {
        state.ratingData = action.payload;
      })

      .addCase(getNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(getNotificationsCount.fulfilled, (state, action) => {
        state.notificationsCount = action.payload;
      })

      .addCase(readNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n._id === action.payload,
        );

        if (notification) {
          notification.isRead = true;
        }
      })

      .addCase(getStaffRoles.fulfilled, (state, action) => {
        state.staffRoles = action.payload;
      })

      .addCase(updateStaffRole.fulfilled, (state, action) => {
        state.staffRoles = state.staffRoles.map((i) =>
          i._id === action.payload._id ? action.payload : i,
        );
      })
      // LOADING (optional global)
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        },
      );
  },
});

export default appSlice.reducer;
