import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const token = localStorage.getItem("token");

// Axios config
const axiosConfig = {
  headers: { Authorization: `Bearer ${token}` },
};

// Fetch rules function
const fetchRules = async () => {
  console.log(axiosConfig);

  const { data } = await axios.get(
    `http://localhost:5000/api/config/lists`,
    axiosConfig,
  );
  return data.data;
};

// Create rule function
const createRule = async (newRule) => {
  const { data } = await axios.post(
    "http://localhost:5000/api/config",
    newRule,
    axiosConfig,
  );
  return data;
};

// Update rule function
const updateRule = async ({ id, ...updates }) => {
  const { data } = await axios.put(
    `http://localhost:5000/api/config/${id}`,
    updates,
    axiosConfig,
  );
  return data;
};

// Delete rule function
const deleteRule = async (id) => {
  const { data } = await axios.delete(
    `http://localhost:5000/api/config/${id}`,
    axiosConfig,
  );
  return data;
};

// Toggle rule function
const toggleRule = async ({ id, is_active }) => {
  const { data } = await axios.patch(
    `http://localhost:5000/api/config/${id}/toggle`,
    { is_active },
    axiosConfig,
  );
  return data;
};

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

  const queryClient = useQueryClient();

  // Query for fetching rules
  const {
    data: rules = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rules"],
    queryFn: fetchRules,
  });

  // Mutation for creating rule
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

  // Mutation for updating rule
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

  // Mutation for deleting rule
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

  // Mutation for toggling rule
  const toggleMutation = useMutation({
    mutationFn: toggleRule,
    onSuccess: () => {
      queryClient.invalidateQueries(["rules"]);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to toggle rule");
    },
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Reset form
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
  };

  // Handle edit - populate form with rule data
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    resetForm();
  };

  // Handle submit
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

  // Handle delete
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    deleteMutation.mutate(id);
  };

  // Handle toggle
  const handleToggle = (id, currentStatus) => {
    toggleMutation.mutate({ id, is_active: !currentStatus });
  };

  // Check if any mutation is loading
  const isLoadingMutation =
    createMutation.isLoading ||
    updateMutation.isLoading ||
    deleteMutation.isLoading ||
    toggleMutation.isLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Markup & Commission Rules
          </h1>
          <p className="text-gray-600 mt-1">
            Manage pricing rules for airlines
          </p>
        </div>

        {/* Form - Always visible */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? "Edit Rule" : "Create New Rule"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Airline Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Airline Code
                </label>
                <input
                  type="text"
                  name="airline_code"
                  value={formData.airline_code}
                  onChange={handleInputChange}
                  placeholder="e.g., BG (leave empty for global)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for all airlines
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

              {/* Status */}
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

            {/* Form Buttons */}
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

        {/* Rules Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading rules...
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500">
              Error: {error?.message || "Failed to load rules"}
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
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No rules found. Create your first rule above!
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {rule.airline_code || "🌍 Global"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {rule.airline_code
                              ? "Specific Airline"
                              : "All Airlines"}
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
    </div>
  );
};

export default MarkupCommissionManagement;
