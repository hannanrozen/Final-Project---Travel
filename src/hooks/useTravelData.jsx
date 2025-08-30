import { createContext, useContext, useReducer, useEffect } from "react";
import { activityAPI } from "../api/activity";
import { categoryAPI } from "../api/category";
import { bannerAPI } from "../api/banner";
import { promoAPI } from "../api/promo";

const TravelDataContext = createContext();

const travelDataReducer = (state, action) => {
  switch (action.type) {
    case "SET_ACTIVITIES":
      return { ...state, activities: action.payload };
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "SET_BANNERS":
      return { ...state, banners: action.payload };
    case "SET_PROMOS":
      return { ...state, promos: action.payload };
    case "SET_LOADING":
      return {
        ...state,
        loading: { ...state.loading, [action.key]: action.payload },
      };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
};

export const TravelDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(travelDataReducer, {
    activities: [],
    categories: [],
    banners: [],
    promos: [],
    loading: {
      activities: false,
      categories: false,
      banners: false,
      promos: false,
    },
    filters: {
      category: null,
      priceRange: [0, 10000000],
      rating: 0,
      search: "",
    },
  });

  const fetchActivities = async () => {
    try {
      dispatch({ type: "SET_LOADING", key: "activities", payload: true });
      const response = await activityAPI.getActivities();
      dispatch({ type: "SET_ACTIVITIES", payload: response.data || [] });
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      dispatch({ type: "SET_LOADING", key: "activities", payload: false });
    }
  };

  const fetchCategories = async () => {
    try {
      dispatch({ type: "SET_LOADING", key: "categories", payload: true });
      const response = await categoryAPI.getCategories();
      dispatch({ type: "SET_CATEGORIES", payload: response.data || [] });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      dispatch({ type: "SET_LOADING", key: "categories", payload: false });
    }
  };

  const fetchBanners = async () => {
    try {
      dispatch({ type: "SET_LOADING", key: "banners", payload: true });
      const response = await bannerAPI.getBanners();
      dispatch({ type: "SET_BANNERS", payload: response.data || [] });
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      dispatch({ type: "SET_LOADING", key: "banners", payload: false });
    }
  };

  const fetchPromos = async () => {
    try {
      dispatch({ type: "SET_LOADING", key: "promos", payload: true });
      const response = await promoAPI.getPromos();
      dispatch({ type: "SET_PROMOS", payload: response.data || [] });
    } catch (error) {
      console.error("Failed to fetch promos:", error);
    } finally {
      dispatch({ type: "SET_LOADING", key: "promos", payload: false });
    }
  };

  const updateFilters = (newFilters) => {
    dispatch({ type: "SET_FILTERS", payload: newFilters });
  };

  const getFilteredActivities = () => {
    return state.activities.filter((activity) => {
      const matchesCategory =
        !state.filters.category ||
        activity.categoryId === state.filters.category;
      const price = activity.price_discount || activity.price || 0;
      const matchesPrice =
        price >= state.filters.priceRange[0] &&
        price <= state.filters.priceRange[1];
      const matchesRating = activity.rating >= state.filters.rating;
      const matchesSearch =
        !state.filters.search ||
        activity.title
          ?.toLowerCase()
          .includes(state.filters.search.toLowerCase()) ||
        activity.description
          ?.toLowerCase()
          .includes(state.filters.search.toLowerCase());

      return matchesCategory && matchesPrice && matchesRating && matchesSearch;
    });
  };

  useEffect(() => {
    fetchActivities();
    fetchCategories();
    fetchBanners();
    fetchPromos();
  }, []);

  return (
    <TravelDataContext.Provider
      value={{
        ...state,
        fetchActivities,
        fetchCategories,
        fetchBanners,
        fetchPromos,
        updateFilters,
        getFilteredActivities,
      }}
    >
      {children}
    </TravelDataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTravelData = () => {
  const context = useContext(TravelDataContext);
  if (!context) {
    throw new Error("useTravelData must be used within a TravelDataProvider");
  }
  return context;
};
