// pages/MarkupCommissionManagement.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllRules,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleStatus,
} from "../api/config";
import { getAirlines } from "../api/flight";

const MarkupCommissionManagement = () => {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    airline_code: "",
    markup_type: "percentage",
    markup_value: "",
    commission_type: "percentage",
    commission_value: "",
    is_active: true,
  });

  const [airlineSearch, setAirlineSearch] = useState("");
  const [showAirlineDropdown, setShowAirlineDropdown] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState(null);

  const queryClient = useQueryClient();

  const {
    data: rules = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rules"],
    queryFn: getAllRules,
  });

  const { data: airlines = [], isLoading: airlinesLoading } = useQuery({
    queryKey: ["airlines"],
    queryFn: getAirlines,
  });

  const filteredAirlines = airlines.filter((airline) => {
    const searchLower = airlineSearch.toLowerCase();
    return (
      airline.Code?.toLowerCase().includes(searchLower) ||
      airline.AriLineName?.toLowerCase().includes(searchLower)
    );
  });

  const createMutation = useMutation({
    mutationFn: createRule,
    onSuccess: () => {
      queryClient.invalidateQueries(["rules"]);
      resetForm();
      alert("Rule created successfully!");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to create rule");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateRule,
    onSuccess: () => {
      queryClient.invalidateQueries(["rules"]);
      resetForm();
      alert("Rule updated successfully!");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to update rule");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries(["rules"]);
      alert("Rule deleted successfully!");
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to delete rule");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleRuleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["rules"]);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to toggle rule");
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAirlineSearch = (e) => {
    const value = e.target.value;
    setAirlineSearch(value);
    setShowAirlineDropdown(true);

    if (value === "") {
      setSelectedAirline(null);
      setFormData({
        ...formData,
        airline_code: "",
      });
    }
  };

  const selectAirline = (airline) => {
    setSelectedAirline(airline);
    setAirlineSearch(airline.Code);
    setFormData({
      ...formData,
      airline_code: airline.Code,
    });
    setShowAirlineDropdown(false);
  };

  const clearAirline = () => {
    setSelectedAirline(null);
    setAirlineSearch("");
    setFormData({
      ...formData,
      airline_code: "",
    });
    setShowAirlineDropdown(false);
  };

  const resetForm = () => {
    setFormData({
      airline_code: "",
      markup_type: "percentage",
      markup_value: "",
      commission_type: "percentage",
      commission_value: "",
      is_active: true,
    });
    setEditingId(null);
    setSelectedAirline(null);
    setAirlineSearch("");
    setShowAirlineDropdown(false);
  };

  const handleEdit = (rule) => {
    setEditingId(rule.id);
    setFormData({
      airline_code: rule.airline_code || "",
      markup_type: rule.markup_type,
      markup_value: rule.markup_value,
      commission_type: rule.commission_type,
      commission_value: rule.commission_value,
      is_active: rule.is_active === 1 || rule.is_active === true,
    });

    if (rule.airline_code) {
      const found = airlines.find((a) => a.Code === rule.airline_code);
      if (found) {
        setSelectedAirline(found);
        setAirlineSearch(found.Code);
      }
    } else {
      setSelectedAirline(null);
      setAirlineSearch("");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      markup_value: parseFloat(formData.markup_value),
      commission_value: parseFloat(formData.commission_value),
      airline_code: formData.airline_code || null,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    deleteMutation.mutate(id);
  };

  const handleToggle = (id, currentStatus) => {
    toggleMutation.mutate({ id, is_active: !currentStatus });
  };

  const isLoadingMutation =
    createMutation.isLoading ||
    updateMutation.isLoading ||
    deleteMutation.isLoading ||
    toggleMutation.isLoading;

  const getAirlineName = (code) => {
    if (!code) return "🌍 Global";
    const airline = airlines.find((a) => a.Code === code);
    return airline ? `${code} - ${airline.AriLineName}` : code;
  };

  // Ensure rules is always an array
  const rulesList = Array.isArray(rules) ? rules : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Markup & Commission Rules
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your pricing rules for airlines
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? "Edit Rule" : "Create New Rule"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        if (airlines.length > 0 && airlineSearch.length > 0) {
                          setShowAirlineDropdown(true);
                        }
                      }}
                      placeholder="Search airline by code or name..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {selectedAirline && (
                      <button
                        type="button"
                        onClick={clearAirline}
                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {showAirlineDropdown && filteredAirlines.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {airlinesLoading ? (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          Loading airlines...
                        </div>
                      ) : (
                        <>
                          <div
                            onClick={() => {
                              clearAirline();
                              setShowAirlineDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                          >
                            <div className="font-medium text-gray-700">
                              🌍 Global
                            </div>
                            <div className="text-xs text-gray-500">
                              Applies to all airlines
                            </div>
                          </div>

                          {filteredAirlines.slice(0, 20).map((airline) => (
                            <div
                              key={airline.ID}
                              onClick={() => selectAirline(airline)}
                              className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${
                                selectedAirline?.ID === airline.ID
                                  ? "bg-blue-50"
                                  : ""
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-800">
                                  {airline.Code}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {airline.AriLineName}
                                </span>
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
                <p className="text-xs text-gray-500 mt-1">
                  {selectedAirline
                    ? `Selected: ${selectedAirline.Code} - ${selectedAirline.AriLineName}`
                    : "Leave empty for global (all airlines)"}
                </p>
              </div>

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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    name="markup_type"
                    value={formData.markup_type}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">%</option>
                    <option value="flat">$</option>
                  </select>
                </div>
              </div>

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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    name="commission_type"
                    value={formData.commission_type}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">%</option>
                    <option value="flat">$</option>
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={isLoadingMutation}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoadingMutation
                  ? "Saving..."
                  : editingId
                    ? "Update Rule"
                    : "Create Rule"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading rules...
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500">
              Error: {error?.message || "Failed to load rules"}
            </div>
          ) : rulesList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No rules found. Create your first rule above!
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
                  {rulesList.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {rule.airline_code ? (
                            <div>
                              <span className="font-bold">
                                {rule.airline_code}
                              </span>
                              <span className="text-gray-500 ml-2 text-xs">
                                {getAirlineName(rule.airline_code)}
                              </span>
                            </div>
                          ) : (
                            "🌍 Global"
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {rule.user_id ? "Your Rule" : "Global Rule"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {rule.markup_value}{" "}
                          {rule.markup_type === "percentage" ? "%" : "$"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {rule.commission_value}{" "}
                          {rule.commission_type === "percentage" ? "%" : "$"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            rule.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {rule.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {rule.user_id ? (
                            <>
                              <button
                                onClick={() =>
                                  handleToggle(rule.id, rule.is_active)
                                }
                                disabled={toggleMutation.isLoading}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  rule.is_active
                                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                } disabled:opacity-50`}
                              >
                                {rule.is_active ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => handleEdit(rule)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(rule.id)}
                                disabled={deleteMutation.isLoading}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Global (read-only)
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkupCommissionManagement;
