'use client';

import { useEffect, useState } from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
import autoTable from 'jspdf-autotable';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

// Define autoTable types
interface AutoTableOptions {
  startY?: number;
  head?: string[][];
  body?: (string | number)[][];
  styles?: {
    fontSize?: number;
    cellPadding?: number;
  };
  headStyles?: {
    fillColor?: number[];
    textColor?: number[];
  };
  alternateRowStyles?: {
    fillColor?: number[];
  };
  margin?: {
    top?: number;
  };
  columnStyles?: {
    [key: number]: {
      cellWidth?: number;
      minCellWidth?: number;
      overflow?: 'linebreak' | 'ellipsize' | 'hidden';
    };
  };
}

// Extend jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => void;
  }
}

type Response = {
  id?: number;
  created_at: string;
  language: string;
  name: string;
  state: string;
  lga: string;
  ward: string;
  age: string;
  gender: string;
  knows_romeo: string;
  knows_muyideen: string;
  knows_abdulrasheed: string;
  heard_savewell: string;
  residence: string;
  phone?: string;
};

type Filters = {
  state: string;
  lga: string;
  gender: string;
  knows_romeo: string;
  knows_abdulrasheed: string;
  search: string;
};

type SummaryStats = {
  total: number;
  knowsRomeoYes: number;
  knowsMuyideenYes: number;
  knowsAbdulrasheedYes: number;
  heardSavewellYes: number;
  ageGroups: Record<string, number>;
  genders: Record<string, number>;
};

export default function Admin() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    state: '',
    lga: '',
    gender: '',
    knows_romeo: '',
    knows_abdulrasheed: '',
    search: '',
  });

  // Summary stats
  const [summary, setSummary] = useState<SummaryStats>({
    total: 0,
    knowsRomeoYes: 0,
    knowsMuyideenYes: 0,
    knowsAbdulrasheedYes: 0,
    heardSavewellYes: 0,
    ageGroups: {},
    genders: {},
  });

  // Simple password check
  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    if (isAuthenticated) {
      async function fetchResponses() {
        try {
          const res = await fetch('/api/get-responses');
          if (!res.ok) throw new Error('Failed to fetch');
          const { responses: data } = await res.json();
          setResponses(data);

          // Calculate summary
          const stats: SummaryStats = {
            total: data.length,
            knowsRomeoYes: data.filter((r: Response) => r.knows_romeo === 'Yes').length,
            knowsMuyideenYes: data.filter((r: Response) => r.knows_muyideen === 'Yes').length,
            knowsAbdulrasheedYes: data.filter((r: Response) => r.knows_abdulrasheed === 'Yes').length,
            heardSavewellYes: data.filter((r: Response) => r.heard_savewell === 'Yes').length,
            ageGroups: data.reduce((acc: Record<string, number>, r: Response) => {
              acc[r.age] = (acc[r.age] || 0) + 1;
              return acc;
            }, {}),
            genders: data.reduce((acc: Record<string, number>, r: Response) => {
              acc[r.gender] = (acc[r.gender] || 0) + 1;
              return acc;
            }, {}),
          };
          setSummary(stats);
        } catch {
          setError('Error loading data');
        } finally {
          setLoading(false);
        }
      }
      fetchResponses();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  // Apply filters
  const filteredResponses = responses.filter(response => {
    return (
      (filters.state === '' || response.state === filters.state) &&
      (filters.lga === '' || response.lga === filters.lga) &&
      (filters.gender === '' || response.gender === filters.gender) &&
      (filters.knows_romeo === '' || response.knows_romeo === filters.knows_romeo) &&
      (filters.knows_abdulrasheed === '' || response.knows_abdulrasheed === filters.knows_abdulrasheed) &&
      (filters.search === '' || 
        response.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        response.residence.toLowerCase().includes(filters.search.toLowerCase()) ||
        response.phone?.includes(filters.search))
    );
  });

  // Get unique values for filters
  const uniqueStates = [...new Set(responses.map(r => r.state))].filter(Boolean);
  const uniqueLgas = [...new Set(responses.map(r => r.lga))].filter(Boolean);
  const uniqueGenders = [...new Set(responses.map(r => r.gender))].filter(Boolean);

  // Prepare CSV data
  const csvData = filteredResponses.map((r, index) => ({
    Serial: index + 1,
    ID: r.id || '',
    'Created At': r.created_at ? new Date(r.created_at).toLocaleString() : '',
    Language: r.language,
    Name: r.name,
    State: r.state,
    LGA: r.lga,
    Ward: r.ward,
    Age: r.age,
    Gender: r.gender,
    'Knows Romeo': r.knows_romeo,
    'Knows Muyideen': r.knows_muyideen,
    'Knows Abdulrasheed': r.knows_abdulrasheed,
    'Heard Savewell': r.heard_savewell,
    Residence: r.residence,
    Phone: r.phone || '',
  }));

  // Export to PDF in landscape
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Admin Dashboard: Polling Responses', 14, 20);
    doc.setFontSize(12);
    doc.text('Generated on: ' + new Date().toLocaleString(), 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Serial', 'ID', 'Created At', 'Language', 'Name', 'State', 'LGA', 'Ward', 'Age', 'Gender', 'Knows Romeo', 'Knows Muyideen', 'Knows Abdulrasheed', 'Heard Savewell', 'Residence', 'Phone']],
      body: filteredResponses.map((r, idx) => [
        idx + 1,
        r.id ?? '',
        r.created_at ? new Date(r.created_at).toLocaleString() : '',
        r.language,
        r.name,
        r.state,
        r.lga,
        r.ward,
        r.age,
        r.gender,
        r.knows_romeo,
        r.knows_muyideen,
        r.knows_abdulrasheed,
        r.heard_savewell,
        r.residence,
        r.phone ?? '',
      ]),
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 40, left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 15 }, // Serial
        1: { cellWidth: 15 }, // ID
        2: { cellWidth: 30 }, // Created At
        3: { cellWidth: 20 }, // Language
        4: { cellWidth: 30 }, // Name
        5: { cellWidth: 20 }, // State
        6: { cellWidth: 20 }, // LGA
        7: { cellWidth: 20 }, // Ward
        8: { cellWidth: 15 }, // Age
        9: { cellWidth: 15 }, // Gender
        10: { cellWidth: 20 }, // Knows Romeo
        11: { cellWidth: 20 }, // Knows Muyideen
        12: { cellWidth: 20 }, // Knows Abdulrasheed
        13: { cellWidth: 20 }, // Heard Savewell
        14: { cellWidth: 40, overflow: 'linebreak' }, // Residence (wider for wrapping)
        15: { cellWidth: 20 }, // Phone
      },
    });

    doc.save('polling-responses.pdf');
  };

  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const currentResponses = filteredResponses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="p-4 border rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white p-4 rounded-lg w-full hover:bg-blue-700 transition-colors duration-200"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-6 text-gray-600 text-center text-lg">Loading...</div>;
  if (error) return <div className="p-6 text-red-500 text-center text-lg">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">Admin Dashboard: Polling Responses</h1>
          <div className="flex flex-wrap gap-2">
            <CSVLink
              data={csvData}
              filename="polling-responses.csv"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
            >
              Export to CSV
            </CSVLink>
            <button
              onClick={exportToPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
            >
              Export to PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search name, residence, phone..."
                className="w-full p-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
              <select
                value={filters.lga}
                onChange={(e) => setFilters({ ...filters, lga: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="">All LGAs</option>
                {uniqueLgas.map(lga => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="">All Genders</option>
                {uniqueGenders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Knows Romeo</label>
              <select
                value={filters.knows_romeo}
                onChange={(e) => setFilters({ ...filters, knows_romeo: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Knows Abdulrasheed</label>
              <select
                value={filters.knows_abdulrasheed}
                onChange={(e) => setFilters({ ...filters, knows_abdulrasheed: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Showing {filteredResponses.length} of {responses.length} responses
            </span>
            <button
              onClick={() => setFilters({
                state: '',
                lga: '',
                gender: '',
                knows_romeo: '',
                knows_abdulrasheed: '',
                search: '',
              })}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Summary Results</h2>
            <div className="space-y-3">
              <p className="text-lg"><strong>Total Responses:</strong> {summary.total}</p>
              <p className="text-lg"><strong>Knows Romeo (Yes):</strong> {summary.knowsRomeoYes} ({summary.total ? ((summary.knowsRomeoYes / summary.total) * 100).toFixed(1) : 0}%)</p>
              <p className="text-lg"><strong>Knows Dr. Muyideen (Yes):</strong> {summary.knowsMuyideenYes} ({summary.total ? ((summary.knowsMuyideenYes / summary.total) * 100).toFixed(1) : 0}%)</p>
              <p className="text-lg"><strong>Knows Dr. Abdulrasheed (Yes):</strong> {summary.knowsAbdulrasheedYes} ({summary.total ? ((summary.knowsAbdulrasheedYes / summary.total) * 100).toFixed(1) : 0}%)</p>
              <p className="text-lg"><strong>Heard of Savewell Homes (Yes):</strong> {summary.heardSavewellYes} ({summary.total ? ((summary.heardSavewellYes / summary.total) * 100).toFixed(1) : 0}%)</p>
              <h3 className="mt-4 font-semibold text-lg text-gray-800">Age Groups:</h3>
              <ul className="list-disc pl-5 text-gray-700">{Object.entries(summary.ageGroups).map(([age, count]) => <li key={age}>{age}: {count}</li>)}</ul>
              <h3 className="mt-4 font-semibold text-lg text-gray-800">Genders:</h3>
              <ul className="list-disc pl-5 text-gray-700">{Object.entries(summary.genders).map(([gender, count]) => <li key={gender}>{gender}: {count}</li>)}</ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Knowledge Questions Breakdown</h3>
            <div style={{ height: '300px' }}>
              <Bar
                data={{
                  labels: ['Knows Romeo', 'Knows Muyideen', 'Knows Abdulrasheed', 'Heard Savewell'],
                  datasets: [
                    {
                      label: 'Yes',
                      data: [
                        summary.knowsRomeoYes,
                        summary.knowsMuyideenYes,
                        summary.knowsAbdulrasheedYes,
                        summary.heardSavewellYes,
                      ],
                      backgroundColor: 'rgba(59, 130, 246, 0.6)',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 1,
                    },
                    {
                      label: 'No',
                      data: [
                        summary.total - summary.knowsRomeoYes,
                        summary.total - summary.knowsMuyideenYes,
                        summary.total - summary.knowsAbdulrasheedYes,
                        summary.total - summary.heardSavewellYes,
                      ],
                      backgroundColor: 'rgba(239, 68, 68, 0.6)',
                      borderColor: 'rgba(239, 68, 68, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Number of Responses' } },
                    x: { title: { display: true, text: 'Questions' } },
                  },
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Knowledge Questions Breakdown', font: { size: 16 } },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">All Responses</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="p-2 border rounded-lg text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Serial', 'ID', 'Created At', 'Language', 'Name', 'State', 'LGA', 'Ward', 'Age', 'Gender', 'Knows Romeo', 'Knows Muyideen', 'Knows Abdulrasheed', 'Heard Savewell', 'Residence', 'Phone'].map(header => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentResponses.map((r, index) => (
                  <tr key={r.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.id || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.language}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.state}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.lga}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.ward}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.age}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.gender}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.knows_romeo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.knows_muyideen}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.knows_abdulrasheed}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.heard_savewell}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{r.residence}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.phone || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pb-4 px-4 gap-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • {filteredResponses.length} records
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                let pageNum;
                if (totalPages <= 10) {
                  pageNum = i + 1;
                } else if (currentPage <= 5) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 4) {
                  pageNum = totalPages - 9 + i;
                } else {
                  pageNum = currentPage - 5 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 ${
                      pageNum === currentPage ? 'bg-blue-800' : 'bg-blue-600'
                    } text-white rounded hover:bg-blue-700 text-sm`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}