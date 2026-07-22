// pages/MarkupCommissionManagement.jsx
import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaCheck,
  FaSearch,
  FaGlobe,
  FaPlane,
  FaPercentage,
  FaDollarSign,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";
import {
  getAllRules,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleStatus,
} from "../api/config";
import { getAirlines } from "../api/flight";

// ============ DELETE MODAL COMPONENT (moved outside) ============
const DeleteModal = ({ isOpen, onClose, onConfirm, targetName, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="inline-block w-full max-w-md overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl shadow-2xl sm:my-8 sm:align-middle">
        <div className="px-6 py-4 bg-linear-to-r from-red-600 to-red-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaTrash className="text-white" /> Delete Rule
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 py-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <FaExclamationCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <p className="text-center text-gray-700 text-lg">
            Are you sure you want to delete this rule?
          </p>
          <p className="text-center text-gray-500 text-sm mt-2">
            <span className="font-semibold">{targetName}</span>
          </p>
          <p className="text-center text-gray-400 text-xs mt-4">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <FaTrash /> Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ SUB-COMPONENT: RuleFormModal ============
const RuleFormModal = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  airlines,
  airlinesLoading,
  isLoading: parentLoading,
}) => {
  // Memoize airlines to prevent unnecessary re-renders
  const memoizedAirlines = useMemo(() => airlines || [], [airlines]);

  // Derive initial form values from props
  const getInitialFormData = useCallback(() => {
    if (initialData) {
      return {
        airline_code: initialData.airline_code || "",
        markup_type: initialData.markup_type || "percentage",
        markup_value: initialData.markup_value || "",
        commission_type: initialData.commission_type || "percentage",
        commission_value: initialData.commission_value || "",
        is_active:
          initialData.is_active === 1 || initialData.is_active === true,
      };
    }
    return {
      airline_code: "",
      markup_type: "percentage",
      markup_value: "",
      commission_type: "percentage",
      commission_value: "",
      is_active: true,
    };
  }, [initialData]);

  // Derive initial airline selection
  const getInitialAirline = useCallback(() => {
    if (initialData?.airline_code) {
      return (
        memoizedAirlines.find((a) => a.Code === initialData.airline_code) ||
        null
      );
    }
    return null;
  }, [initialData, memoizedAirlines]);

  // Local state for the form
  const [formData, setFormData] = useState(getInitialFormData);
  const [airlineSearch, setAirlineSearch] = useState(() => {
    const airline = getInitialAirline();
    return airline ? airline.Code : "";
  });
  const [selectedAirline, setSelectedAirline] = useState(getInitialAirline);
  const [showAirlineDropdown, setShowAirlineDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when initialData changes - using a key-based approach instead of useEffect
  // We'll use a key prop on the form to force reset when initialData changes
  const formKey = useMemo(() => {
    return initialData?.id || "new";
  }, [initialData]);

  // When the key changes, reset the form state
  useEffect(() => {
    if (isOpen) {
      const newFormData = getInitialFormData();
      const newAirline = getInitialAirline();

      // Use a timeout to batch state updates
      const timeoutId = setTimeout(() => {
        setFormData(newFormData);
        setSelectedAirline(newAirline);
        setAirlineSearch(newAirline ? newAirline.Code : "");
        setErrorMessage("");
        setSuccessMessage("");
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [formKey, isOpen, getInitialFormData, getInitialAirline]);

  const isEditing = !!initialData;
  const editingId = initialData?.id || null;

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (type === "number" && value !== "" && isNaN(parseFloat(value))) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrorMessage("");
    setSuccessMessage("");
  }, []);

  const handleAirlineSearch = useCallback((e) => {
    const value = e.target.value;
    setAirlineSearch(value);
    setShowAirlineDropdown(true);
    if (value === "") {
      setSelectedAirline(null);
      setFormData((prev) => ({ ...prev, airline_code: "" }));
    }
    setErrorMessage("");
    setSuccessMessage("");
  }, []);

  const selectAirline = useCallback((airline) => {
    setSelectedAirline(airline);
    setAirlineSearch(airline.Code);
    setFormData((prev) => ({ ...prev, airline_code: airline.Code }));
    setShowAirlineDropdown(false);
    setErrorMessage("");
    setSuccessMessage("");
  }, []);

  const clearAirline = useCallback(() => {
    setSelectedAirline(null);
    setAirlineSearch("");
    setFormData((prev) => ({ ...prev, airline_code: "" }));
    setShowAirlineDropdown(false);
    setErrorMessage("");
    setSuccessMessage("");
  }, []);

  const filteredAirlines = useMemo(() => {
    if (!airlineSearch.trim()) return memoizedAirlines;
    const searchLower = airlineSearch.toLowerCase();
    return memoizedAirlines.filter(
      (airline) =>
        airline.Code.toLowerCase().includes(searchLower) ||
        airline.AriLineName.toLowerCase().includes(searchLower),
    );
  }, [memoizedAirlines, airlineSearch]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setErrorMessage("");
      setSuccessMessage("");

      if (!formData.markup_value || parseFloat(formData.markup_value) < 0) {
        setErrorMessage("Please enter a valid markup value");
        return;
      }
      if (
        !formData.commission_value ||
        parseFloat(formData.commission_value) < 0
      ) {
        setErrorMessage("Please enter a valid commission value");
        return;
      }

      const payload = {
        ...formData,
        markup_value: parseFloat(formData.markup_value),
        commission_value: parseFloat(formData.commission_value),
        airline_code: formData.airline_code || null,
      };

      setIsLoading(true);
      try {
        await onSave(payload, editingId);
        setSuccessMessage(
          isEditing
            ? "Rule updated successfully!"
            : "Rule created successfully!",
        );
        setTimeout(() => {
          setSuccessMessage("");
          onClose();
        }, 1500);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Operation failed");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, editingId, onSave, onClose, isEditing],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="inline-block w-full max-w-2xl overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl shadow-2xl sm:my-8 sm:align-middle">
        <div className="px-6 py-4 bg-linear-to-r from-blue-600 to-blue-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {isEditing ? (
              <>
                <FaEdit className="text-white" />
                Edit Rule
              </>
            ) : (
              <>
                <FaPlus className="text-white" />
                Create New Rule
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-6">
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2">
              <FaCheckCircle className="w-5 h-5" />
              <span className="flex-1">{successMessage}</span>
              <button
                onClick={() => setSuccessMessage("")}
                className="text-green-500 hover:text-green-700"
              >
                <FaTimes />
              </button>
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
              <FaExclamationCircle className="w-5 h-5" />
              <span className="flex-1">{errorMessage}</span>
              <button
                onClick={() => setErrorMessage("")}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          )}

          <form key={formKey} onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Airline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Airline
                </label>
                <div className="relative">
                  <div className="flex">
                    <input
                      type="text"
                      value={airlineSearch}
                      onChange={handleAirlineSearch}
                      onFocus={() => {
                        if (
                          memoizedAirlines.length > 0 &&
                          airlineSearch.length > 0
                        ) {
                          setShowAirlineDropdown(true);
                        }
                      }}
                      placeholder="Search airline by code or name..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {selectedAirline && (
                      <button
                        type="button"
                        onClick={clearAirline}
                        className="px-4 py-2.5 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 text-gray-600 transition-colors"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  {showAirlineDropdown && filteredAirlines.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {airlinesLoading ? (
                        <div className="px-4 py-2 text-gray-500 text-sm flex items-center gap-2">
                          <FaSpinner className="animate-spin" />
                          Loading airlines...
                        </div>
                      ) : (
                        <>
                          <div
                            onClick={() => {
                              clearAirline();
                              setShowAirlineDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors flex items-center gap-2"
                          >
                            <FaGlobe className="text-green-600" />
                            <div>
                              <div className="font-medium text-gray-700">
                                Global
                              </div>
                              <div className="text-xs text-gray-500">
                                Applies to all airlines
                              </div>
                            </div>
                          </div>
                          {filteredAirlines.slice(0, 20).map((airline) => (
                            <div
                              key={airline.ID}
                              onClick={() => selectAirline(airline)}
                              className={`px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-2 ${
                                selectedAirline?.ID === airline.ID
                                  ? "bg-blue-50"
                                  : ""
                              }`}
                            >
                              <FaPlane className="text-blue-600" />
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-800">
                                    {airline.Code}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {airline.AriLineName}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {filteredAirlines.length > 20 && (
                            <div className="px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-100">
                              {filteredAirlines.length - 20} more airlines...
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  {selectedAirline ? (
                    <>
                      <FaCheck className="text-green-600" />
                      Selected:{" "}
                      <span className="font-medium">
                        {selectedAirline.Code}
                      </span>{" "}
                      - {selectedAirline.AriLineName}
                    </>
                  ) : (
                    <>
                      <FaGlobe className="text-gray-400" />
                      Leave empty for global (all airlines)
                    </>
                  )}
                </p>
              </div>

              {/* Markup */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Markup
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="markup_value"
                    value={formData.markup_value}
                    onChange={handleInputChange}
                    placeholder="Value"
                    step="0.01"
                    min="0"
                    required
                    onKeyDown={(e) => {
                      if (["e", "E", "-", "+"].includes(e.key))
                        e.preventDefault();
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    name="markup_type"
                    value={formData.markup_type}
                    onChange={handleInputChange}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="percentage">
                      <FaPercentage /> %
                    </option>
                    <option value="flat">
                      <FaDollarSign /> $
                    </option>
                  </select>
                </div>
              </div>

              {/* Commission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commission
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="commission_value"
                    value={formData.commission_value}
                    onChange={handleInputChange}
                    placeholder="Value"
                    step="0.01"
                    min="0"
                    required
                    onKeyDown={(e) => {
                      if (["e", "E", "-", "+"].includes(e.key))
                        e.preventDefault();
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    name="commission_type"
                    value={formData.commission_type}
                    onChange={handleInputChange}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="percentage">
                      <FaPercentage /> %
                    </option>
                    <option value="flat">
                      <FaDollarSign /> $
                    </option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading || parentLoading}
                className="flex-1 px-6 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                {isLoading || parentLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <FaCheck />
                    {isEditing ? "Update Rule" : "Create Rule"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
const MarkupCommissionManagement = () => {
  const [editingRule, setEditingRule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  // Queries
  const {
    data: rulesResponse,
    isLoading: rulesLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rules"],
    queryFn: getAllRules,
  });
  const rules = rulesResponse?.data || [];

  const { data: airlinesResponse, isLoading: airlinesLoading } = useQuery({
    queryKey: ["airlines"],
    queryFn: getAirlines,
  });

  // Memoize airlines to prevent unnecessary re-renders and dependency changes
  const airlines = useMemo(
    () => airlinesResponse?.data || [],
    [airlinesResponse],
  );

  // Handlers
  const handleOpenModal = (rule = null) => {
    setEditingRule(rule);
    setIsModalOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);
    setDeleteTargetName("");
  }, []);

  const handleSaveRule = useCallback(
    async (payload, id) => {
      setIsLoading(true);
      try {
        if (id) {
          await updateRule(id, payload);
        } else {
          await createRule(payload);
        }
        await queryClient.invalidateQueries(["rules"]);
        setSuccessMessage(
          id ? "Rule updated successfully!" : "Rule created successfully!",
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Failed to save rule");
        setTimeout(() => setErrorMessage(""), 3000);
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient],
  );

  const handleDeleteRule = useCallback(
    async (id) => {
      setIsLoading(true);
      try {
        await deleteRule(id);
        await queryClient.invalidateQueries(["rules"]);
        setSuccessMessage("Rule deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        closeDeleteModal();
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "Failed to delete rule",
        );
        setTimeout(() => setErrorMessage(""), 3000);
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient, closeDeleteModal],
  );

  const handleToggleRule = useCallback(
    async (id, currentStatus) => {
      setIsLoading(true);
      try {
        await toggleRuleStatus(id, !currentStatus);
        await queryClient.invalidateQueries(["rules"]);
        setSuccessMessage("Rule status updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "Failed to toggle rule status",
        );
        setTimeout(() => setErrorMessage(""), 3000);
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient],
  );

  const openDeleteModal = useCallback((id, name) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setIsDeleteModalOpen(true);
  }, []);

  const getAirlineName = useCallback(
    (code) => {
      if (!code) return "Global";
      const airline = airlines.find((a) => a.Code === code);
      return airline ? `${code} - ${airline.AriLineName}` : code;
    },
    [airlines],
  );

  // Main render
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="bg-blue-600 text-white p-2 rounded-xl">
                  <FaPlane className="w-6 h-6" />
                </span>
                Markup & Commission Rules
              </h1>
              <p className="text-gray-600 mt-2 ml-14">
                Manage pricing rules and commissions for airlines
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200 hover:shadow-xl flex items-center gap-2 font-medium"
            >
              <FaPlus /> Add New Rule
            </button>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded-xl flex items-center gap-3">
            <FaCheckCircle className="w-5 h-5" />
            <span className="flex-1">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-500 hover:text-green-700"
            >
              <FaTimes />
            </button>
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl flex items-center gap-3">
            <FaExclamationCircle className="w-5 h-5" />
            <span className="flex-1">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-500 hover:text-red-700"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaSearch className="text-blue-600" /> All Rules
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {rules.length}
                </span>
              </h2>
            </div>
          </div>

          {rulesLoading ? (
            <div className="p-12 text-center text-gray-500">
              <FaSpinner className="animate-spin w-8 h-8 mx-auto mb-3 text-blue-600" />
              <p>Loading rules...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-red-500">
              <FaExclamationCircle className="w-8 h-8 mx-auto mb-3" />
              <p>Error: {error?.message || "Failed to load rules"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Airline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Markup
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rules.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <FaPlane className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-gray-400">No rules found</p>
                          <button
                            onClick={() => handleOpenModal()}
                            className="mt-3 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <FaPlus className="w-3 h-3" /> Create your first
                            rule
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => (
                      <tr
                        key={rule.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {rule.airline_code ? (
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaPlane className="w-4 h-4 text-blue-600" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <FaGlobe className="w-4 h-4 text-green-600" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {rule.airline_code || "Global"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {rule.airline_code
                                  ? getAirlineName(rule.airline_code)
                                  : "All Airlines"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {rule.markup_value}
                            </span>
                            <span className="text-xs text-gray-500">
                              {rule.markup_type === "percentage" ? (
                                <FaPercentage className="inline w-3 h-3" />
                              ) : (
                                <FaDollarSign className="inline w-3 h-3" />
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {rule.commission_value}
                            </span>
                            <span className="text-xs text-gray-500">
                              {rule.commission_type === "percentage" ? (
                                <FaPercentage className="inline w-3 h-3" />
                              ) : (
                                <FaDollarSign className="inline w-3 h-3" />
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${
                              rule.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {rule.is_active ? (
                              <FaCheck className="w-3 h-3" />
                            ) : (
                              <FaTimes className="w-3 h-3" />
                            )}
                            {rule.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                handleToggleRule(rule.id, rule.is_active)
                              }
                              disabled={isLoading}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                                rule.is_active
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              } disabled:opacity-50`}
                            >
                              {rule.is_active ? (
                                <FaToggleOn className="w-4 h-4" />
                              ) : (
                                <FaToggleOff className="w-4 h-4" />
                              )}
                              {rule.is_active ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleOpenModal(rule)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-all flex items-center gap-1"
                            >
                              <FaEdit className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() =>
                                openDeleteModal(
                                  rule.id,
                                  rule.airline_code || "Global",
                                )
                              }
                              disabled={isLoading}
                              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-all flex items-center gap-1 disabled:opacity-50"
                            >
                              <FaTrash className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Rule Form Modal */}
      <RuleFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingRule}
        onSave={handleSaveRule}
        airlines={airlines}
        airlinesLoading={airlinesLoading}
        isLoading={isLoading}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteRule(deleteTargetId)}
        targetName={deleteTargetName}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MarkupCommissionManagement;
