import React, { useState } from 'react';
import axios from 'axios';

export default function GradePortal() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selection, setSelection] = useState('info');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const baseUrl = 'https://friscoisdhacapi.vercel.app/api';

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

  const navItems = [
    { key: 'info', label: 'Student Info' },
    { key: 'gpa', label: 'GPA' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'transcript', label: 'Transcript' },
    { key: 'currentclasses', label: 'Current Classes' },
    { key: 'pastclasses', label: 'Past Classes' },
  ];

  const renderResult = () => {
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
            <div>{renderResult()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}