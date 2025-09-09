import { createContext, useContext, useReducer, useCallback } from "react";
import {
  getBanners,
  getActivities,
  getPromos,
  getCategories,
  getActivitiesByCategoryId,
} from "../api/index.js";

const TravelDataContext = createContext();

const initialState = {
  banners: {
    data: [],
    loading: false,
    error: null,
  },
  activities: {
    data: [],
    loading: false,
    error: null,
  },
  promos: {
    data: [],
    loading: false,
    error: null,
  },
  categories: {
    data: [],
    loading: false,
    error: null,
  },
  search: {
    results: [],
    loading: false,
    error: null,
    filters: {},
  },
};

function travelDataReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        [action.dataType]: {
          ...state[action.dataType],
          loading: action.loading,
        },
      };

    case "SET_DATA":
      return {
        ...state,
        [action.dataType]: {
          ...state[action.dataType],
          data: action.data,
          loading: false,
          error: null,
        },
      };

    case "SET_ERROR":
      return {
        ...state,
        [action.dataType]: {
          ...state[action.dataType],
          error: action.error,
          loading: false,
        },
      };

    case "SET_SEARCH_FILTERS":
      return {
        ...state,
        search: {
          ...state.search,
          filters: { ...state.search.filters, ...action.filters },
        },
      };

    default:
      return state;
  }
}

export function TravelDataProvider({ children }) {
  const [state, dispatch] = useReducer(travelDataReducer, initialState);

  const setLoading = useCallback((dataType, loading) => {
    dispatch({ type: "SET_LOADING", dataType, loading });
  }, []);

  const setData = useCallback((dataType, data) => {
    dispatch({ type: "SET_DATA", dataType, data });
  }, []);

  const setError = useCallback((dataType, error) => {
    dispatch({ type: "SET_ERROR", dataType, error });
  }, []);

  // Fetch banners
  const fetchBanners = useCallback(async () => {
    setLoading("banners", true);
    try {
      const response = await getBanners();
      if (response.success) {
        setData("banners", response.data?.data || []);
      } else {
        setError("banners", response.error || "Failed to fetch banners");
      }
    } catch (error) {
      setError("banners", error.message);
    }
  }, [setLoading, setData, setError]);

  // Fetch activities
  const fetchActivities = useCallback(
    async (limit = null) => {
      setLoading("activities", true);
      try {
        const response = await getActivities();
        if (response.success) {
          let activities = response.data?.data || [];
          if (limit) {
            activities = activities.slice(0, limit);
          }
          setData("activities", activities);
        } else {
          setError(
            "activities",
            response.error || "Failed to fetch activities"
          );
        }
      } catch (error) {
        setError("activities", error.message);
      }
    },
    [setLoading, setData, setError]
  );

  // Fetch promos
  const fetchPromos = useCallback(
    async (limit = null) => {
      setLoading("promos", true);
      try {
        const response = await getPromos();
        if (response.success) {
          let promos = response.data?.data || [];
          if (limit) {
            promos = promos.slice(0, limit);
          }
          setData("promos", promos);
        } else {
          setError("promos", response.error || "Failed to fetch promos");
        }
      } catch (error) {
        setError("promos", error.message);
      }
    },
    [setLoading, setData, setError]
  );

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading("categories", true);
    try {
      const response = await getCategories();
      if (response.success) {
        setData("categories", response.data?.data || []);
      } else {
        setError("categories", response.error || "Failed to fetch categories");
      }
    } catch (error) {
      setError("categories", error.message);
    }
  }, [setLoading, setData, setError]);

  // Fetch activities by category
  const fetchActivitiesByCategory = useCallback(
    async (categoryId) => {
      setLoading("search", true);
      try {
        const response = await getActivitiesByCategoryId(categoryId);
        if (response.success) {
          setData("search", response.data?.data || []);
        } else {
          setError("search", response.error || "Failed to fetch activities");
        }
      } catch (error) {
        setError("search", error.message);
      }
    },
    [setLoading, setData, setError]
  );

  // Search activities
  const searchActivities = useCallback(
    async (searchParams) => {
      setLoading("search", true);
      dispatch({ type: "SET_SEARCH_FILTERS", filters: searchParams });

      try {
        const response = await getActivities();
        if (response.success) {
          let results = response.data?.data || [];

          // Apply client-side filtering
          if (searchParams.destination) {
            results = results.filter(
              (activity) =>
                activity.title
                  ?.toLowerCase()
                  .includes(searchParams.destination.toLowerCase()) ||
                activity.city
                  ?.toLowerCase()
                  .includes(searchParams.destination.toLowerCase()) ||
                activity.province
                  ?.toLowerCase()
                  .includes(searchParams.destination.toLowerCase())
            );
          }

          setData("search", results);
        } else {
          setError("search", response.error || "Failed to search activities");
        }
      } catch (error) {
        setError("search", error.message);
      }
    },
    [setLoading, setData, setError]
  );

  const value = {
    ...state,
    fetchBanners,
    fetchActivities,
    fetchPromos,
    fetchCategories,
    fetchActivitiesByCategory,
    searchActivities,
  };

  return (
    <TravelDataContext.Provider value={value}>
      {children}
    </TravelDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTravelData() {
  const context = useContext(TravelDataContext);
  if (!context) {
    throw new Error("useTravelData must be used within a TravelDataProvider");
  }
  return context;
}
