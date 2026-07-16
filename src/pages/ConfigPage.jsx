import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getMarkups,
  createMarkup,
  updateMarkup,
  deleteMarkup,
  getCommissions,
  createCommission,
  updateCommission,
  deleteCommission,
} from "../api/config";

const ConfigManagement = () => {
  const { logout } = useAuth();
  const [markups, setMarkups] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMarkup, setEditingMarkup] = useState(null);
  const [editingCommission, setEditingCommission] = useState(null);

  // Form states
  const [markupForm, setMarkupForm] = useState({
    airline_code: "",
    type: "percentage",
    value: 0,
  });

  const [commissionForm, setCommissionForm] = useState({
    airline_code: "",
    type: "percentage",
    value: 0,
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [markupData, commissionData] = await Promise.all([
        getMarkups(),
        getCommissions(),
      ]);
      setMarkups(markupData.data || []);
      setCommissions(commissionData.data || []);
    } catch (error) {
      console.error("Error loading config:", error);
      alert("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  // MARKUP Handlers
  const handleMarkupSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMarkup) {
        await updateMarkup(editingMarkup.id, markupForm);
      } else {
        await createMarkup(markupForm);
      }
      resetMarkupForm();
      await loadData();
    } catch (error) {
      console.error("Error saving markup:", error);
      alert("Failed to save markup");
    }
  };

  const handleEditMarkup = (markup) => {
    setEditingMarkup(markup);
    setMarkupForm({
      airline_code: markup.airline_code || "",
      type: markup.type,
      value: markup.value,
    });
  };

  const handleDeleteMarkup = async (id) => {
    if (!confirm("Are you sure you want to delete this markup?")) return;
    try {
      await deleteMarkup(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting markup:", error);
      alert("Failed to delete markup");
    }
  };

  const resetMarkupForm = () => {
    setEditingMarkup(null);
    setMarkupForm({ airline_code: "", type: "percentage", value: 0 });
  };

  // COMMISSION Handlers
  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCommission) {
        await updateCommission(editingCommission.id, commissionForm);
      } else {
        await createCommission(commissionForm);
      }
      resetCommissionForm();
      await loadData();
    } catch (error) {
      console.error("Error saving commission:", error);
      alert("Failed to save commission");
    }
  };

  const handleEditCommission = (commission) => {
    setEditingCommission(commission);
    setCommissionForm({
      airline_code: commission.airline_code || "",
      type: commission.type,
      value: commission.value,
    });
  };

  const handleDeleteCommission = async (id) => {
    if (!confirm("Are you sure you want to delete this commission?")) return;
    try {
      await deleteCommission(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting commission:", error);
      alert("Failed to delete commission");
    }
  };

  const resetCommissionForm = () => {
    setEditingCommission(null);
    setCommissionForm({ airline_code: "", type: "percentage", value: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            ⚙️ Configuration Management
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              Back to Search
            </button>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {loading && <div className="text-center py-8">Loading...</div>}

        {/* Markup Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📈 Markup Rules
          </h2>

          <form onSubmit={handleMarkupSubmit} className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Airline Code
                </label>
                <input
                  type="text"
                  value={markupForm.airline_code}
                  onChange={(e) =>
                    setMarkupForm({
                      ...markupForm,
                      airline_code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., BG (blank for default)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={markupForm.type}
                  onChange={(e) =>
                    setMarkupForm({
                      ...markupForm,
                      type: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <input
                  type="number"
                  value={markupForm.value}
                  onChange={(e) =>
                    setMarkupForm({
                      ...markupForm,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700"
                >
                  {editingMarkup ? "Update Markup" : "Add Markup"}
                </button>
                {editingMarkup && (
                  <button
                    type="button"
                    onClick={resetMarkupForm}
                    className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Markup List */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Airline</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Value</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {markups.map((markup) => (
                  <tr key={markup.id} className="border-t">
                    <td className="px-4 py-2">
                      {markup.airline_code || "Default"}
                    </td>
                    <td className="px-4 py-2 capitalize">{markup.type}</td>
                    <td className="px-4 py-2">
                      {markup.type === "percentage"
                        ? `${markup.value}%`
                        : `BDT ${markup.value}`}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditMarkup(markup)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMarkup(markup.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commission Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            💰 Commission Rules
          </h2>

          <form onSubmit={handleCommissionSubmit} className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Airline Code
                </label>
                <input
                  type="text"
                  value={commissionForm.airline_code}
                  onChange={(e) =>
                    setCommissionForm({
                      ...commissionForm,
                      airline_code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., BG (blank for default)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={commissionForm.type}
                  onChange={(e) =>
                    setCommissionForm({
                      ...commissionForm,
                      type: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <input
                  type="number"
                  value={commissionForm.value}
                  onChange={(e) =>
                    setCommissionForm({
                      ...commissionForm,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
                >
                  {editingCommission ? "Update Commission" : "Add Commission"}
                </button>
                {editingCommission && (
                  <button
                    type="button"
                    onClick={resetCommissionForm}
                    className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Commission List */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Airline</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Value</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-t">
                    <td className="px-4 py-2">
                      {commission.airline_code || "Default"}
                    </td>
                    <td className="px-4 py-2 capitalize">{commission.type}</td>
                    <td className="px-4 py-2">
                      {commission.type === "percentage"
                        ? `${commission.value}%`
                        : `BDT ${commission.value}`}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEditCommission(commission)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCommission(commission.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigManagement;
