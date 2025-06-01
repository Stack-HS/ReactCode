import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function GradePortal() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selection, setSelection] = useState('info');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // New state variables for ECFinder
  const [ecQuery, setEcQuery] = useState('');
  const [ecResults, setEcResults] = useState([]);
  const [ecCurrentIndex, setEcCurrentIndex] = useState(0);
  const [ecLoading, setEcLoading] = useState(false);
  const [ecError, setEcError] = useState('');
  const [ecPage, setEcPage] = useState(1);
  const [ecTotalPages, setEcTotalPages] = useState(1);
  const [ecTotalResults, setEcTotalResults] = useState(0);
  const [debugMessage, setDebugMessage] = useState(''); // Add debug message state
  const scrollContainerRef = useRef(null);

  const baseUrl = 'https://friscoisdhacapi.vercel.app/api';
  const ecApiToken = "z5Vdkas3kjaf4fk93jf84230fjgh8329cjaaabcddde3fafa0";
  const ecBaseUrl = "https://corsproxy.io/?https://api.capplica.com/api/search";

  const navItems = [
    { key: 'info', label: 'Student Info' },
    { key: 'gpa', label: 'GPA' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'transcript', label: 'Transcript' },
    { key: 'currentclasses', label: 'Current Classes' },
    { key: 'pastclasses', label: 'Past Classes' },
    { key: 'ecfinder', label: 'Extracurricular Finder' }
  ];

  // Function to fetch EC results
  const fetchEcResults = async (page = 1) => {
    if (!ecQuery.trim()) {
      setEcError('Please enter a search query');
      return;
    }
    
    try {
      setEcLoading(true);
      setEcError('');
      setEcResults([]);
      
      const url = `${ecBaseUrl}?token=${ecApiToken}&query=${encodeURIComponent(ecQuery)}&page=${page}`;
      const response = await axios.get(url);
      
      if (response.data) {
        const results = response.data.results || [];
        setEcResults(results);
        setEcCurrentIndex(0);
        setEcPage(page);
        setEcTotalPages(response.data.total_pages || 1);
        setEcTotalResults(response.data.total_results || results.length);
        
        if (results.length === 0) {
          setEcError('No results found');
        }
      } else {
        setEcError('Invalid response format from server');
      }
    } catch (error) {
      setEcError('Failed to fetch extracurriculars.');
    } finally {
      setEcLoading(false);
    }
  };

  // Function to navigate to next EC result
  const nextEcResult = () => {
    if (ecCurrentIndex < ecResults.length - 1) {
      setEcCurrentIndex(ecCurrentIndex + 1);
    } else if (ecPage < ecTotalPages) {
      // Move to next page
      fetchEcResults(ecPage + 1);
    } else {
      // Wrap to first result of first page
      fetchEcResults(1);
    }
  };

  // Function to navigate to previous EC result
  const prevEcResult = () => {
    if (ecCurrentIndex > 0) {
      setEcCurrentIndex(ecCurrentIndex - 1);
    } else if (ecPage > 1) {
      // Move to previous page
      fetchEcResults(ecPage - 1);
    } else {
      // Wrap to last result of last page
      fetchEcResults(ecTotalPages);
    }
  };

  // Test function
  const testSearch = () => {
    setEcQuery('texas');
    setTimeout(() => {
      fetchEcResults(1);
    }, 100);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selection === 'ecfinder') {
        if (e.key === 'ArrowRight') {
          nextEcResult();
        } else if (e.key === 'ArrowLeft') {
          prevEcResult();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selection, ecCurrentIndex, ecResults.length, nextEcResult, prevEcResult]);

  const fetchData = async () => {
    let url = '';
    switch (selection) {
      case 'info':
        url = `${baseUrl}/info?username=${username}&password=${password}`;
        break;
      case 'gpa':
        url = `${baseUrl}/gpa?username=${username}&password=${password}`;
        break;
      case 'schedule':
        url = `${baseUrl}/schedule?username=${username}&password=${password}`;
        break;
      case 'transcript':
        url = `${baseUrl}/transcript?username=${username}&password=${password}`;
        break;
      case 'currentclasses':
        url = `${baseUrl}/currentclasses?username=${username}&password=${password}`;
        break;
      case 'pastclasses':
        url = `${baseUrl}/pastclasses?username=${username}&password=${password}&quarter=1`;
        break;
      default:
        setResult('Please select a valid option.');
        return;
    }
    try {
      setLoading(true);
      const res = await axios.get(url, { timeout: 10000 });
      setResult(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.code === 'ECONNABORTED') {
        setResult('Error: Request timed out. Please try again later.');
      } else {
        setResult(`Error: ${error.message}`);
      }
    }
  };

  const renderResult = () => {
    if (selection === 'ecfinder') {
      return (
        <div className="space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search for extracurriculars..."
                value={ecQuery}
                onChange={(e) => setEcQuery(e.target.value)}
                className="flex-1 p-2 border rounded"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchEcResults(1);
                  }
                }}
              />
              <button
                onClick={() => fetchEcResults(1)}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                disabled={ecLoading}
              >
                {ecLoading ? 'Searching...' : 'Search'}
              </button>
              <button
                onClick={testSearch}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Test Search
              </button>
            </div>
            
            {ecError && (
              <div className="text-red-500 p-2 bg-red-50 rounded">
                {ecError}
              </div>
            )}
            
            {ecLoading && (
              <div className="text-gray-600 p-2">
                Searching for extracurriculars...
              </div>
            )}
            
            {!ecLoading && ecResults && ecResults.length > 0 && (
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold">Extracurricular Results</h2>
                  <div className="text-sm text-gray-500">
                    Result {ecCurrentIndex + 1} of {ecResults.length} (Page {ecPage} of {ecTotalPages})
                  </div>
                </div>
                
                <div 
                  ref={scrollContainerRef}
                  className="bg-white shadow rounded p-4 overflow-x-auto"
                  style={{ 
                    scrollBehavior: 'smooth',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <div className="min-w-full">
                    {ecResults[ecCurrentIndex] && (
                      <>
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-blue-600">{ecResults[ecCurrentIndex].Name}</h3>
                          <p className="text-gray-600">{ecResults[ecCurrentIndex].Type} • {ecResults[ecCurrentIndex].Subject}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold">Location:</p>
                            <p>{ecResults[ecCurrentIndex].Location}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Price:</p>
                            <p>{ecResults[ecCurrentIndex].Price}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Details:</p>
                            <p>{ecResults[ecCurrentIndex].Details}</p>
                          </div>
                          <div>
                            <p className="font-semibold">State:</p>
                            <p>{ecResults[ecCurrentIndex].FullState}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="font-semibold">Summary:</p>
                          <p className="text-gray-700">{ecResults[ecCurrentIndex].Summary}</p>
                        </div>
                        <div className="mt-4">
                          <a 
                            href={ecResults[ecCurrentIndex].Link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 underline"
                          >
                            Learn More
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <button
                    onClick={prevEcResult}
                    className={`p-2 rounded-full ${
                      ecCurrentIndex > 0 || ecPage > 1
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={nextEcResult}
                    className={`p-2 rounded-full ${
                      ecCurrentIndex < ecResults.length - 1 || ecPage < ecTotalPages
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4 text-sm text-gray-500 text-center">
                  Use left/right arrow keys to navigate between results
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (!result) return <div className="text-gray-600">No data to display.</div>;
    if (typeof result === 'string') return <div className="text-red-500">{result}</div>;

    switch (selection) {
      case 'info': {
        const { birthdate, campus, grade, id, name, counselor } = result;
        return (
          <div className="bg-white shadow rounded p-4">
            <h2 className="text-xl font-bold mb-2">Student Info</h2>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>ID:</strong> {id}</p>
            <p><strong>Birthdate:</strong> {birthdate}</p>
            <p><strong>Campus:</strong> {campus}</p>
            <p><strong>Grade:</strong> {grade}</p>
            <p><strong>Counselor:</strong> {counselor}</p>
          </div>
        );
      }
      case 'gpa': {
        const { unweightedGPA, weightedGPA, rank } = result;
        return (
          <div className="bg-white shadow rounded p-4">
            <h2 className="text-xl font-bold mb-2">GPA Information</h2>
            <p><strong>Unweighted GPA:</strong> {unweightedGPA}</p>
            <p><strong>Weighted GPA:</strong> {weightedGPA}</p>
            <p><strong>Rank:</strong> {rank}</p>
          </div>
        );
      }
      case 'schedule': {
        const { studentSchedule } = result;
        return (
          <div className="bg-white shadow rounded p-4 overflow-x-auto">
            <h2 className="text-xl font-bold mb-2">Schedule</h2>
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Course Code</th>
                  <th className="border p-2">Course Name</th>
                  <th className="border p-2">Teacher</th>
                  <th className="border p-2">Days</th>
                  <th className="border p-2">Periods</th>
                  <th className="border p-2">Room</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {studentSchedule.map((course, index) => (
                  <tr key={index}>
                    <td className="border p-2">{course.courseCode}</td>
                    <td className="border p-2">{course.courseName}</td>
                    <td className="border p-2">{course.teacher}</td>
                    <td className="border p-2">{course.days}</td>
                    <td className="border p-2">{course.periods}</td>
                    <td className="border p-2">{course.room}</td>
                    <td className="border p-2">{course.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case 'transcript': {
        const { studentTranscript } = result;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Transcript</h2>
            {studentTranscript.map((term, index) => (
              <div key={index} className="bg-white shadow rounded p-4">
                <h3 className="text-lg font-semibold mb-1">
                  {term.yearsAttended} — Grade Level {term.gradeLevel} — {term.building} (Credits: {term.totalCredits})
                </h3>
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2">Course Code</th>
                      <th className="border p-2">Course Name</th>
                      <th className="border p-2">Sem 1</th>
                      <th className="border p-2">Sem 2</th>
                      <th className="border p-2">Final</th>
                      <th className="border p-2">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {term.courses.map((course, idx) => (
                      <tr key={idx}>
                        <td className="border p-2">{course.courseCode}</td>
                        <td className="border p-2">{course.courseName}</td>
                        <td className="border p-2">{course.sem1Grade}</td>
                        <td className="border p-2">{course.sem2Grade}</td>
                        <td className="border p-2">{course.finalGrade}</td>
                        <td className="border p-2">{course.courseCredits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        );
      }
      case 'currentclasses': {
        const { currentClasses } = result;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Current Classes</h2>
            {currentClasses.map((cls, index) => (
              <div key={index} className="bg-white shadow rounded p-4">
                <h3 className="text-lg font-semibold">{cls.name}</h3>
                <p><strong>Grade:</strong> {cls.grade}</p>
                <p><strong>Weight:</strong> {cls.weight}</p>
                <p><strong>Credits:</strong> {cls.credits}</p>
                <p><strong>Last Updated:</strong> {cls.lastUpdated}</p>
                {cls.assignments && cls.assignments.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-semibold">Assignments:</h4>
                    <ul className="list-disc ml-5">
                      {cls.assignments.map((assignment, idx) => (
                        <li key={idx}>
                          {assignment.name} — {assignment.category}
                          {assignment.dateDue ? ` — Due: ${assignment.dateDue}` : ''}
                          {assignment.score ? ` — Score: ${assignment.score}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }
      case 'pastclasses': {
        const { pastClasses } = result;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Past Classes</h2>
            {pastClasses.map((cls, index) => (
              <div key={index} className="bg-white shadow rounded p-4">
                <h3 className="text-lg font-semibold">{cls.name}</h3>
                <p><strong>Grade:</strong> {cls.grade}</p>
                <p><strong>Weight:</strong> {cls.weight}</p>
                <p><strong>Credits:</strong> {cls.credits}</p>
                <p><strong>Last Updated:</strong> {cls.lastUpdated}</p>
                {cls.assignments && cls.assignments.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-semibold">Assignments:</h4>
                    <ul className="list-disc ml-5">
                      {cls.assignments.map((assignment, idx) => (
                        <li key={idx}>
                          {assignment.name} — {assignment.category}
                          {assignment.dateDue ? ` — Due: ${assignment.dateDue}` : ''}
                          {assignment.score ? ` — Score: ${assignment.score}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }
      default:
        return <pre>{JSON.stringify(result, null, 2)}</pre>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      {/* MacOS-style window container */}
      <div className="bg-gray-200 rounded-lg shadow-lg w-full max-w-5xl">
        {/* Window Header */}
        <div className="flex items-center p-2 bg-gray-300 rounded-t-lg">
          <div className="flex space-x-2 ml-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex-1 text-center text-gray-800 font-medium">
            Grade Portal
          </div>
          <div className="w-8"></div>
        </div>
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-1/4 p-4 border-r border-gray-300 bg-gray-100">
            <h3 className="text-lg font-bold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.key}>
                  <button
                    className={`w-full text-left p-2 rounded ${
                      selection === item.key
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-blue-100'
                    }`}
                    onClick={() => setSelection(item.key)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Main Content Area */}
          <div className="w-3/4 p-6">
            {selection !== 'ecfinder' && (
              <div className="space-y-4 mb-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={fetchData}
                  className="w-full bg-blue-500 text-white py-2 rounded"
                >
                  {loading ? 'Loading...' : 'Get Info'}
                </button>
              </div>
            )}
            <div>{renderResult()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}