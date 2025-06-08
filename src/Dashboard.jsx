import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import styles from './Dashboard.module.css';

const endpoints = [
  { key: 'info', label: 'Student Info', url: (u, p) => `/info?username=${u}&password=${p}` },
  { key: 'gpa', label: 'GPA', url: (u, p) => `/gpa?username=${u}&password=${p}` },
  { key: 'transcript', label: 'Transcript', url: (u, p) => `/transcript?username=${u}&password=${p}` },
  { key: 'currentclasses', label: 'Current Classes', url: (u, p) => `/currentclasses?username=${u}&password=${p}` },
  { key: 'pastclasses_1', label: 'Past Classes', url: (u, p) => `/pastclasses?username=${u}&password=${p}&quarter=1` },
  { key: 'pastclasses_2', label: 'Past Classes', url: (u, p) => `/pastclasses?username=${u}&password=${p}&quarter=2` },
  { key: 'pastclasses_3', label: 'Past Classes', url: (u, p) => `/pastclasses?username=${u}&password=${p}&quarter=3` },
  { key: 'pastclasses_4', label: 'Past Classes', url: (u, p) => `/pastclasses?username=${u}&password=${p}&quarter=4` },
  { key: 'schedule', label: 'Schedule', url: (u, p) => `/schedule?username=${u}&password=${p}` },
];

const baseUrl = 'https://friscoisdhacapi.vercel.app/api';

function getInitials(name) {
  if (!name) return '';
  // If name is "Last, First", convert to "First Last"
  let first = '', last = '';
  if (name.includes(',')) {
    [last, first] = name.split(',').map(s => s.trim());
  } else {
    [first, last] = name.split(' ');
  }
  return (first?.[0] || '') + (last?.[0] || '');
}

function StudentInfoModal({ open, onClose, info }) {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, marginBottom: 16, fontWeight: 800 }}>Student Info</h2>
        <div style={{ marginBottom: 12 }}><strong>Name:</strong> {info.name}</div>
        <div style={{ marginBottom: 12 }}><strong>ID:</strong> {info.id}</div>
        <div style={{ marginBottom: 12 }}><strong>Birthdate:</strong> {info.birthdate}</div>
        <div style={{ marginBottom: 12 }}><strong>Campus:</strong> {info.campus}</div>
        <div style={{ marginBottom: 12 }}><strong>Grade:</strong> {info.grade}</div>
        <div style={{ marginBottom: 12 }}><strong>Counselor:</strong> {info.counselor}</div>
        <button className={styles.backButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function GradesSection({ pastClasses, onClassClick }) {
  // Handle cases where pastClasses is not an array or is empty
  if (!Array.isArray(pastClasses) || pastClasses.length === 0) {
    // Render placeholders or a message when no classes are found
    return (
      <div className={styles.classList}>
        <div className={styles.noData}>No classes found.</div>
        {/* Optionally render a few placeholder divs to match the requested look */}
        {[...Array(4)].map((_, index) => (
          <div key={`placeholder-${index}`} className={`${styles.classRow} ${styles.placeholder}`} style={{ height: '50px', marginBottom: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            {/* Placeholder content */}
          </div>
        ))}
      </div>
    );
  }

  // Modified to handle classes with Period property for sorting and ensure Period is a string for parseInt
  const sortedClasses = [...pastClasses].sort((a, b) => {
    const periodA = parseInt(a?.Period?.toString(), 10) || 999;
    const periodB = parseInt(b?.Period?.toString(), 10) || 999;
    return periodA - periodB;
  });

  return (
    <div className={styles.classList}>
      {sortedClasses.map((cls, idx) => {
        // Add checks for null or undefined class object and name property
        const courseCode = cls?.courseCode?.trim() || 'N/A'; // Use courseCode if available
        const courseName = cls?.name?.split('-')[1]?.trim() || cls?.name || 'Unknown Class';
        const period = cls?.Period || '--';
        const grade = cls?.grade || 'N/A';

        return (
          <div
            key={idx}
            className={styles.classRow}
            onClick={() => onClassClick && onClassClick(cls)}
          >
            <div>
              {/* Display period and course name */}
              <div style={{ fontWeight: 700 }}>{`${period}${cls?.Days || ''}`} {courseName !== 'Unknown Class' ? courseName : ''}</div> {/* Added Period and Day */} 
              {/* Display course code */}
              {courseCode !== 'N/A' && ( // Always show course code if available
                 <div style={{ fontWeight: 600, fontSize: '1rem', color: '#6b8fcf', marginTop: 2 }}>{courseCode}</div>
              )}
            </div>
            {/* Display grade badge if grade is available and not 'N/A' */}
            {grade !== 'N/A' && <div className={styles.gradeBadge}>{grade}</div>}
          </div>
        );
      })}
    </div>
  );
}

function AssignmentsSection({ cls, onBack }) {
  // Placeholder for assignment UI, will update when user provides design
  return (
    <div className={styles.sectionCard}>
      <button className={styles.backButton} onClick={onBack}>Back to Grades</button>
      <h2 style={{ marginTop: 0 }}>{cls.name}</h2>
      <div style={{ marginBottom: 16 }}><strong>Grade:</strong> {cls.grade}</div>
      <div style={{ marginBottom: 16 }}><strong>Credits:</strong> {cls.credits}</div>
      <div style={{ marginBottom: 16 }}><strong>Weight:</strong> {cls.weight}</div>
      <div style={{ marginBottom: 16 }}><strong>Last Updated:</strong> {cls.lastUpdated}</div>
      <h3 style={{ marginTop: 24 }}>Assignments</h3>
      {cls.assignments && cls.assignments.length > 0 ? (
        <ul style={{ marginTop: 12 }}>
          {cls.assignments.map((a, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <strong>{a.name}</strong> — {a.category} {a.dateDue ? `— Due: ${a.dateDue}` : ''} {a.score ? `— Score: ${a.score}` : ''}
            </li>
          ))}
        </ul>
      ) : (
        <div>No assignments found.</div>
      )}
    </div>
  );
}

const bottomBarIcons = [
  { key: 'home', label: 'Home', img: '/home.png' },
  { key: 'grades', label: 'Grades', img: '/grades.png' },
  { key: 'growth', label: 'Growth', img: '/growth.png' },
  { key: 'discovery', label: 'Discovery', img: '/discovery.png' },
  { key: 'portfolio', label: 'Portfolio', img: '/portfolio.png' },
];

// Transcript Page Component
function TranscriptPage({ transcriptData, gpaData, onBack }) {
  if (!transcriptData) return <div className={styles.noData}>No transcript data available.</div>;
  
  return (
    <div className={styles.sectionCard}>
      <button className={styles.backButton} onClick={onBack}>Back to Dashboard</button>
      <h2 style={{ marginTop: 0 }}>Transcript</h2>
      {transcriptData.map((term, idx) => (
        <div key={idx} style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>
            {term.yearsAttended} — Grade Level {term.gradeLevel} — {term.building} (Credits: {term.totalCredits})
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.08)', borderRadius: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', color: '#e3eafd' }}>Course Code</th>
                <th style={{ textAlign: 'left', padding: '8px', color: '#e3eafd' }}>Course Name</th>
                <th style={{ textAlign: 'left', padding: '8px', color: '#e3eafd' }}>Sem 1</th>
                <th style={{ textAlign: 'left', padding: '8px', color: '#e3eafd' }}>Sem 2</th>
                <th style={{ textAlign: 'left', padding: '8px', color: '#e3eafd' }}>Final</th>
                <th style={{ textAlign: 'left', padding: '8px', color: '#e3eafd' }}>Credits</th>
              </tr>
            </thead>
            <tbody>
              {term.courses.map((course, idx2) => (
                <tr key={idx2}>
                  <td style={{ padding: '8px', color: '#fff' }}>{course.courseCode}</td>
                  <td style={{ padding: '8px', color: '#fff' }}>{course.courseName}</td>
                  <td style={{ padding: '8px', color: '#fff' }}>{course.sem1Grade}</td>
                  <td style={{ padding: '8px', color: '#fff' }}>{course.sem2Grade}</td>
                  <td style={{ padding: '8px', color: '#fff' }}>{course.finalGrade}</td>
                  <td style={{ padding: '8px', color: '#fff' }}>{course.courseCredits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {gpaData && (
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>GPA Information</h3>
          <p style={{ marginBottom: '8px', color: '#e3eafd' }}><strong>Unweighted GPA:</strong> {gpaData.unweightedGPA}</p>
          <p style={{ marginBottom: '8px', color: '#e3eafd' }}><strong>Weighted GPA:</strong> {gpaData.weightedGPA}</p>
          <p style={{ marginBottom: '8px', color: '#e3eafd' }}><strong>Rank:</strong> {gpaData.rank}</p>
        </div>
      )}
    </div>
  );
}

// GPA Page Component
function GpaPage({ gpaData, onBack }) {
  if (!gpaData) return <div className={styles.noData}>No GPA data available.</div>;

  return (
    <div className={styles.sectionCard}>
      <button className={styles.backButton} onClick={onBack}>Back to Dashboard</button>
      <h2 style={{ marginTop: 0 }}>GPA Information</h2>
      <p><strong>Unweighted GPA:</strong> {gpaData.unweightedGPA}</p>
      <p><strong>Weighted GPA:</strong> {gpaData.weightedGPA}</p>
      <p><strong>Rank:</strong> {gpaData.rank}</p>
    </div>
  );
}

export default function Dashboard({ username, password }) {
  const [cache, setCache] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState('pastclasses_1');
  const [activeQuarter, setActiveQuarter] = useState('1');
  const [showStudentInfo, setShowStudentInfo] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [showGpa, setShowGpa] = useState(false);
  const [showFullGpa, setShowFullGpa] = useState(false);
  const [bottomBarActive, setBottomBarActive] = useState('home');
  const transcriptRef = useRef(null);
  const gpaRef = useRef(null);

  // EC Finder State
  const [ecQuery, setEcQuery] = useState('');
  const [ecResults, setEcResults] = useState([]);
  const [ecCurrentIndex, setEcCurrentIndex] = useState(0);
  const [ecLoading, setEcLoading] = useState(false);
  const [ecError, setEcError] = useState('');
  const [ecTotalResults, setEcTotalResults] = useState(0);
  const [ecCache, setEcCache] = useState({});
  const ecScrollContainerRef = useRef(null);

  // Home Tab Data State
  const [homeData, setHomeData] = useState({ classes: { aDay: [], bDay: [] }, assignments: [] });

  // Assignment Pagination State - REMOVED
  // const [assignmentPage, setAssignmentPage] = useState(0);
  const assignmentsPerPage = 8; // 2 rows of 4

  const ecApiToken = "z5Vdkas3kjaf4fk93jf84230fjgh8329cjaaabcddde3fafa0";
  const ecBaseUrl = "https://corsproxy.io/?https://api.capplica.com/api/search";

  // Define EC navigation functions first, before they are used
  const nextEcResult = useCallback(() => {
    if (ecResults.length === 0) return;
    
    if (ecCurrentIndex === ecResults.length - 1) {
      setEcCurrentIndex(0);
    } else {
      setEcCurrentIndex(ecCurrentIndex + 1);
    }
  }, [ecCurrentIndex, ecResults.length]);

  const prevEcResult = useCallback(() => {
    if (ecResults.length === 0) return;
    
    if (ecCurrentIndex === 0) {
      setEcCurrentIndex(ecResults.length - 1);
    } else {
      setEcCurrentIndex(ecCurrentIndex - 1);
    }
  }, [ecCurrentIndex, ecResults.length]);

  // Function to fetch all EC results
  const fetchEcResults = async () => {
    if (!ecQuery.trim()) {
      setEcError('Please enter a search query');
      return;
    }
    
    try {
      setEcLoading(true);
      setEcError('');
      
      // Check cache first
      if (ecCache[ecQuery]) {
        setEcResults(ecCache[ecQuery].results);
        setEcCurrentIndex(0);
        setEcTotalResults(ecCache[ecQuery].totalResults);
        setEcLoading(false);
        return;
      }
      
      // Fetch first page to get total pages
      const firstPageUrl = `${ecBaseUrl}?token=${ecApiToken}&query=${encodeURIComponent(ecQuery)}&page=1`;
      const firstPageResponse = await axios.get(firstPageUrl);
      
      if (!firstPageResponse.data) {
        setEcError('Invalid response format from server');
        return;
      }

      const totalPages = firstPageResponse.data.total_pages || 1;
      const totalResults = firstPageResponse.data.total_results || 0;
      
      // Fetch all pages in parallel
      const pagePromises = [];
      for (let page = 1; page <= totalPages; page++) {
        if (page === 1) {
          pagePromises.push(Promise.resolve(firstPageResponse.data));
        } else {
          const pageUrl = `${ecBaseUrl}?token=${ecApiToken}&query=${encodeURIComponent(ecQuery)}&page=${page}`;
          pagePromises.push(axios.get(pageUrl).then(res => res.data));
        }
      }

      const pageResults = await Promise.all(pagePromises);
      
      // Combine all results into a single array
      const allResults = pageResults.reduce((acc, pageData) => {
        return acc.concat(pageData.results || []);
      }, []);

      // Cache the results
      setEcCache(prev => ({
        ...prev,
        [ecQuery]: {
          results: allResults,
          totalResults: totalResults
        }
      }));
      
      setEcResults(allResults);
      setEcCurrentIndex(0);
      setEcTotalResults(totalResults);
      
      if (allResults.length === 0) {
        setEcError('No results found');
      }
    } catch (error) {
      setEcError('Failed to fetch extracurriculars.');
    } finally {
      setEcLoading(false);
    }
  };

  // Handle keyboard navigation for EC finder
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (bottomBarActive === 'discovery' && ecResults.length > 0) {
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
  }, [bottomBarActive, ecResults.length, nextEcResult, prevEcResult]);

  // Fetch initial data for Dashboard
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setCache({});
    setErrors({});

    const fetchAllData = async () => {
      const results = await Promise.all(
        endpoints.map(async (ep) => {
          let retries = 3; // Number of retries
          let lastError = null;
          
          while (retries > 0) {
            try {
              const url = baseUrl + ep.url(username, password);
              // Increased timeout to 120 seconds (2 minutes)
              const res = await axios.get(url, { timeout: 120000 });
              
              // Check if response is empty or invalid
              if (res.status >= 200 && res.status < 300 && res.data) {
                // For currentclasses endpoint, check if currentClasses is empty
                if (ep.key === 'currentclasses') {
                  if (!res.data.currentClasses || res.data.currentClasses.length === 0) {
                    console.log('Empty current classes data received, retrying...');
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
                    continue;
                  }
                }
                
                // For schedule endpoint, check if studentSchedule is empty
                if (ep.key === 'schedule' && (!res.data.studentSchedule || res.data.studentSchedule.length === 0)) {
                  console.log('Empty schedule data received, retrying...');
                  retries--;
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  continue;
                }

                // For transcript endpoint, check if studentTranscript is empty
                if (ep.key === 'transcript' && (!res.data.studentTranscript || res.data.studentTranscript.length === 0)) {
                  console.log('Empty transcript data received, retrying...');
                  retries--;
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  continue;
                }
                
                console.log(`Successfully fetched ${ep.label}:`, res.data);
                return { key: ep.key, data: res.data };
              } else {
                console.log(`Received empty or invalid data for ${ep.label}:`, res.data);
                retries--;
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
              }
            } catch (err) {
              console.error(`Failed to fetch ${ep.label}:`, err);
              lastError = err;
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
              }
            }
          }
          
          // If we've exhausted all retries, return the last error
          return { key: ep.key, error: `Failed to fetch ${ep.label} after retries: ${lastError?.message || 'Unknown error'}` };
        })
      );

      if (!isMounted) return;

      const newCache = {};
      const newErrors = {};
      let info = null;
      let scheduleData = null;
      let currentClassesData = null;

      results.forEach(({ key, data, error }) => {
        if (data) {
          newCache[key] = data;
          if (key === 'info') info = data;
          if (key === 'schedule') scheduleData = data;
          if (key === 'currentclasses') currentClassesData = data;
        }
        if (error) newErrors[key] = error;
      });

      setCache(newCache);
      setErrors(newErrors);
      setStudentInfo(info);
      setLoading(false);

      // Only process data if we have valid current classes data
      if (currentClassesData && currentClassesData.currentClasses && currentClassesData.currentClasses.length > 0) {
        // Process schedule data for home tab classes (A/B Day)
        const processedScheduleClasses = [];
        if (scheduleData && scheduleData.studentSchedule && Array.isArray(scheduleData.studentSchedule)) {
          console.log('Raw Schedule Data:', scheduleData.studentSchedule);
          
          // Create a map to track unique classes
          const uniqueClasses = new Map();
          
          // Process classes in pairs (first semester only)
          for (let i = 0; i < scheduleData.studentSchedule.length; i += 4) {
            // Only process the first two entries (first semester A and B day)
            for (let j = 0; j < 2; j++) {
              const cls = scheduleData.studentSchedule[i + j];
              if (cls && typeof cls === 'object' && cls.courseName) {
                // Get the class name before the hyphen and remove semester marker
                const className = cls.courseName.split('-')[0].trim().replace(/\s+S\d+.*$/, '');
                const key = `${className}-${cls.periods}-${cls.days}`;
                
                // Only add if we haven't seen this class before
                if (!uniqueClasses.has(key)) {
                  uniqueClasses.set(key, {
                    name: className,
                    Period: cls.periods || 'Z',
                    Days: cls.days || 'Unknown',
                    courseCode: cls.courseCode,
                    teacher: cls.teacher,
                    room: cls.room
                  });
                }
              }
            }
          }
          
          // Convert map values to array
          processedScheduleClasses.push(...uniqueClasses.values());
        }

        const aDayClasses = processedScheduleClasses
          .filter(cls => cls.Days === 'A' && !cls.name?.toLowerCase().includes('advisory'))
          .sort((a, b) => {
            const periodA = parseInt(a.Period, 10) || 999;
            const periodB = parseInt(b.Period, 10) || 999;
            return periodA - periodB;
          });

        const bDayClasses = processedScheduleClasses
          .filter(cls => cls.Days === 'B' && !cls.name?.toLowerCase().includes('advisory'))
          .sort((a, b) => {
            const periodA = parseInt(a.Period, 10) || 999;
            const periodB = parseInt(b.Period, 10) || 999;
            return periodA - periodB;
          });

        // Process assignments from current classes for home tab
        const processedAssignments = [];
        currentClassesData.currentClasses.forEach(cls => {
          if (cls && cls.assignments && Array.isArray(cls.assignments)) {
            cls.assignments.forEach(assignment => {
              if (assignment && typeof assignment === 'object' && assignment.name) {
                const dueDate = assignment.dateDue ? new Date(assignment.dateDue) : null;
                processedAssignments.push({
                  ...assignment,
                  className: cls.name || 'Unknown Class',
                  dateDue: dueDate,
                  score: assignment.score || null,
                  totalPoints: assignment.totalPoints || null
                });
              }
            });
          }
        });

        // Sort assignments by dateDue (latest first)
        processedAssignments.sort((a, b) => {
          if (!a.dateDue && !b.dateDue) return 0;
          if (!a.dateDue) return 1;
          if (!b.dateDue) return -1;
          return b.dateDue - a.dateDue;
        });

        setHomeData(prev => ({
          ...prev,
          classes: { aDay: aDayClasses, bDay: bDayClasses },
          currentClasses: currentClassesData.currentClasses,
          assignments: processedAssignments
        }));
      } else {
        console.log('Skipping data processing due to invalid or empty current classes data');
      }
    };

    fetchAllData();

    return () => { isMounted = false; };
  }, [username, password]);

  const handlePastClassesClick = (quarter) => {
    setActiveKey(`pastclasses_${quarter}`);
    setActiveQuarter(quarter);
    setSelectedClass(null);
  };

  // Tabs for MP1-MP4 (only used in 'grades' view)
  const mpTabs = (
    <div className={styles.tabs}>
      {['1', '2', '3', '4'].map((quarter) => (
        <button
          key={quarter}
          className={
            styles.tab +
            (activeQuarter === quarter ? ' ' + styles.tabActive : '')
          }
          onClick={() => handlePastClassesClick(quarter)}
        >
          MP{quarter}
        </button>
      ))}
    </div>
  );

  // Define sections that are conditionally rendered outside the main switch
  const GradesView = () => (
     <>
       <div className={styles.sectionContainer}>
         <h2 className={styles.sectionTitle}>Current Classes</h2>
         {homeData.currentClasses && homeData.currentClasses.length > 0 ? (
           <GradesSection pastClasses={homeData.currentClasses} onClassClick={setSelectedClass} />
         ) : ( 
           errors['currentclasses'] ? 
             <div className={styles.errorMessage}>{errors['currentclasses']}</div> 
             : 
             <div className={styles.noData}>No current classes found.</div>
         )}
       </div>
       <div className={styles.sectionContainer}>
         <h2 className={styles.sectionTitle}>Past Classes</h2>
         {mpTabs}
         {activeKey.startsWith('pastclasses_') && cache[activeKey] && cache[activeKey].pastClasses ? (
            <GradesSection pastClasses={cache[activeKey].pastClasses} onClassClick={setSelectedClass} />
         ) : (errors[activeKey] ? <div className={styles.errorMessage}>{errors[activeKey]}</div> : <div className={styles.noData}>Select a marking period.</div>)}

         {/* Section buttons for Transcript and GPA (within Grades view) */}
         <div className={styles.bottomSectionButtons} style={{ marginTop: '1.5rem' }}> {/* Added margin */}
           <button className={styles.sectionButton} onClick={() => setShowFullTranscript(true)}>
              <img src="/transcript.png" alt="Transcript" className={styles.bottomBarIcon} style={{ marginRight: 12, verticalAlign: 'middle' }} />
             {showFullTranscript ? 'Hide Transcript' : 'Transcript'}
           </button>
           <button className={styles.sectionButton} onClick={() => setShowGpa((v) => !v)}>
              <img src="/gpa.png" alt="Rate My Professor" className={styles.bottomBarIcon} style={{ marginRight: 12, verticalAlign: 'middle' }} />
              Rate My Professor
           </button>
         </div>

         {/* Transcript and GPA sections (conditionally rendered within Grades view) */}
         {showFullTranscript && cache['transcript'] && cache['transcript'].studentTranscript ? (
            <div ref={transcriptRef} className={styles.sectionCard}>
              <h2 style={{ marginTop: 0 }}>Transcript</h2>
              {/* ... Transcript table rendering ... */}
               {cache['transcript'].studentTranscript.map((term, idx) => (
                 <div key={idx} style={{ marginBottom: 24 }}>
                   <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>
                     {term.yearsAttended} — Grade Level {term.gradeLevel} — {term.building} (Credits: {term.totalCredits})
                   </div>
                   <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.08)', borderRadius: 8 }}>
                     <thead>
                       <tr>
                         <th style={{ textAlign: 'left', padding: '8px', color: '#e3eafd' }}>Course Code</th>
                         <th style={{ textAlign: 'left', padding: '8px', color: '#e3eafd' }}>Course Name</th>
                         <th style={{ textAlign: 'left', padding: '8px', color: '#e3eafd' }}>Sem 1</th>
                         <th style={{ textAlign: 'left', padding: '8px', color: '#e3eafd' }}>Sem 2</th>
                         <th style={{ textAlign: 'left', padding: '8px', color: '#e3eafd' }}>Final</th>
                         <th style={{ textAlign: 'left', padding: '8px', color: '#e3eafd' }}>Credits</th>
                       </tr>
                     </thead>
                     <tbody>
                       {term.courses.map((course, idx2) => (
                         <tr key={idx2}>
                           <td style={{ padding: '8px', color: '#fff' }}>{course.courseCode}</td>
                           <td style={{ padding: '8px', color: '#fff' }}>{course.courseName}</td>
                           <td style={{ padding: '8px', color: '#fff' }}>{course.sem1Grade}</td>
                           <td style={{ padding: '8px', color: '#fff' }}>{course.sem2Grade}</td>
                           <td style={{ padding: '8px', color: '#fff' }}>{course.finalGrade}</td>
                           <td style={{ padding: '8px', color: '#fff' }}>{course.courseCredits}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ))}
             </div>
         ) : (showFullTranscript && errors['transcript'] ? <div className={styles.errorMessage}>{errors['transcript']}</div> : null)}
       </div>
     </>
  );

  // Define Discovery Content (EC Finder)
  const DiscoveryView = () => (
    <div className={styles.discoveryContent}>
      <h2 className={styles.discoveryTitle}>Extracurricular Finder</h2>
      <p className={styles.discoverySubtitle}>Discover opportunities that match your interests</p>

      <div className={styles.ecSearchSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search for extracurriculars..."
            value={ecQuery}
            onChange={(e) => setEcQuery(e.target.value)}
            className={styles.searchInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchEcResults();
              }
            }}
          />
          <button
            onClick={() => fetchEcResults()}
            className={styles.searchButton}
            disabled={ecLoading}
          >
            {ecLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {ecError && (
          <div className={styles.errorMessage}>
            {ecError}
          </div>
        )}

        {ecLoading && (
          <div className={styles.loadingMessage}>
            Searching for extracurriculars...
          </div>
        )}

        {!ecLoading && ecResults && ecResults.length > 0 && (
          <div className={styles.resultsContainer}>
            <div className={styles.resultsHeader}>
              <h3>Results</h3>
              <div className={styles.resultsInfo}>
                {ecCurrentIndex + 1}/{ecTotalResults}
              </div>
            </div>

            <div
              ref={ecScrollContainerRef}
              className={styles.resultCard}
            >
              {ecResults[ecCurrentIndex] && (
                <>
                  <div className={styles.resultHeader}>
                    <h4>{ecResults[ecCurrentIndex].Details}</h4>
                    <p>{ecResults[ecCurrentIndex].Type} • {ecResults[ecCurrentIndex].Subject}</p>
                  </div>

                  <div className={styles.resultGrid}>
                    <div className={styles.resultSection}>
                      <div className={styles.resultField}>
                        <span className={styles.fieldLabel}>Host</span>
                        <span className={styles.fieldValue}>{ecResults[ecCurrentIndex].Name}</span>
                      </div>
                      <div className={styles.resultField}>
                        <span className={styles.fieldLabel}>Price</span>
                        <span className={styles.fieldValue}>{ecResults[ecCurrentIndex].Price}</span>
                      </div>
                    </div>
                    <div className={styles.resultSection}>
                      <div className={styles.resultField}>
                        <span className={styles.fieldLabel}>Format</span>
                        <span className={styles.fieldValue}>{ecResults[ecCurrentIndex].Location}</span>
                      </div>
                      <div className={styles.resultField}>
                        <span className={styles.fieldLabel}>State</span>
                        <span className={styles.fieldValue}>{ecResults[ecCurrentIndex].FullState}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.resultSummary}>
                    <span className={styles.fieldLabel}>Summary</span>
                    <p>{ecResults[ecCurrentIndex].Summary}</p>
                  </div>

                  <a
                    href={ecResults[ecCurrentIndex].Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.learnMoreLink}
                  >
                    Learn More
                    <svg className={styles.externalLinkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 0 002 2h10a2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </>
              )}
            </div>

            <div className={styles.navigationButtons}>
              <button
                onClick={prevEcResult}
                className={`${styles.navButton} ${styles.navButtonActive}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextEcResult}
                className={`${styles.navButton} ${styles.navButtonActive}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className={styles.keyboardHint}>
              Use left/right arrow keys to navigate between results
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Main content rendering based on bottomBarActive
  let pageContent = null;

  if (loading) {
    pageContent = <div className={styles.loadingMessage}>Loading all data, please wait...</div>;
  } else if (selectedClass) {
    pageContent = <AssignmentsSection cls={selectedClass} onBack={() => setSelectedClass(null)} />;
  } else if (showFullTranscript) {
    pageContent = <TranscriptPage transcriptData={cache['transcript']?.studentTranscript} gpaData={cache['gpa']} onBack={() => setShowFullTranscript(false)} />;
  } else if (showFullGpa) {
    pageContent = <GpaPage gpaData={cache['gpa']} onBack={() => setShowFullGpa(false)} />;
  } else {
     switch (bottomBarActive) {
       case 'home':
         console.log('Rendering Home tab with data:', homeData); // Log homeData before rendering
         const currentAssignments = homeData.assignments.slice(
           // assignmentPage * assignmentsPerPage,
           // (assignmentPage + 1) * assignmentsPerPage
         );
         const assignmentBlocks = [];
         for (let i = 0; i < currentAssignments.length; i += assignmentsPerPage) {
           assignmentBlocks.push(currentAssignments.slice(i, i + assignmentsPerPage));
         }
         pageContent = (
           <div className={styles.homeDashboardContent}>
             {errors.schedule ? (
               <div className={styles.errorMessage}>{errors.schedule}</div>
             ) : (
               <div className={styles.classesSection}>
                 <div className={styles.classDayColumn}>
                   <div className={styles.classDayHeader}>A Day</div>
                   {/* Always render GradesSection for A Day, let it handle empty state */}
                   {console.log('Passing A Day classes to GradesSection:', homeData.classes.aDay)} {/* Log data passed to GradesSection */}
                   <GradesSection pastClasses={homeData.classes.aDay} onClassClick={setSelectedClass} />
                 </div>
                 <div className={styles.classDayColumn}>
                   <div className={styles.classDayHeader}>B Day</div>
                   {/* Always render GradesSection for B Day, let it handle empty state */}
                   {console.log('Passing B Day classes to GradesSection:', homeData.classes.bDay)} {/* Log data passed to GradesSection */}
                   <GradesSection pastClasses={homeData.classes.bDay} onClassClick={setSelectedClass} />
                 </div>
               </div>
             )}

             {errors.currentclasses ? (
               <div className={styles.errorMessage}>{errors.currentclasses}</div>
             ) : (
               <div className={styles.assignmentsSection}>
                 <h2 className={styles.sectionTitle}>
                    Assignments
                 </h2>
                 <div className={styles.assignmentCardsScrollContainer}>
                   {assignmentBlocks.map((block, blockIndex) => (
                     <div key={blockIndex} className={styles.assignmentBlockGrid}>
                       {block.map((assignment, index) => (
                        <div key={index} className={styles.assignmentCard}>
                          <div className={styles.assignmentTitle}>{assignment.name}</div>
                          <div className={styles.assignmentDate}>
                            {assignment.dateDue ? assignment.dateDue.toLocaleDateString() : 'No Due Date'}
                          </div>
                          {assignment.score && (
                            <div className={styles.assignmentScore}>
                              {assignment.score}
                            </div>
                          )}
                        </div>
                       ))}
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Transcript and Rate My Professor Buttons */}
             <div className={styles.bottomSectionButtons}>
               <button className={styles.sectionButton} onClick={() => setShowFullTranscript(true)}>
                 <img src="/transcript.png" alt="Transcript" className={styles.bottomBarIcon} />
                 Transcript
               </button>
               <button className={styles.sectionButton} onClick={() => setShowGpa((v) => !v)}>
                 <img src="/gpa.png" alt="Rate My Professor" className={styles.bottomBarIcon} />
                 Rate My Professor
               </button>
             </div>
           </div>
         );
         break;
       case 'grades':
         pageContent = <GradesView />;
         break;
       case 'discovery':
         pageContent = <DiscoveryView />;
         break;
       default:
         pageContent = <div className={styles.comingSoon}>Coming soon...</div>;
     }
  }

  // Bottom bar navigation
  const bottomBar = (
    <div className={styles.bottomBar}>
      {bottomBarIcons.map((item) => (
        <button
          key={item.key}
          className={styles.bottomBarItem + (bottomBarActive === item.key ? ' ' + styles.bottomBarItemActive : '')}
          onClick={() => setBottomBarActive(item.key)}
        >
          <img src={item.img} alt={item.label} className={styles.bottomBarIcon} />
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.headerTitle}>Dashboard</div>
          <div className={styles.headerDate}>{new Date().toLocaleDateString()}</div>
        </div>
        {studentInfo && (
          <div
            className={styles.initialsIconProfile}
            style={{ background: "linear-gradient(#e3eafd, #e3eafd), url('/profile.png') center/cover no-repeat" }}
            onClick={() => setShowStudentInfo(true)}
            title={studentInfo.name}
          >
            {getInitials(studentInfo.name)}
          </div>
        )}
      </div>
      {/* Main Page Content */}
      <div className={styles.mainContentArea}>
        <div
          key={`${bottomBarActive}-${selectedClass?.name || 'none'}-${showFullTranscript}-${showFullGpa}`}
          className={styles.pageTransitionContainer}
        >
          {pageContent}
        </div>
      </div>
      {/* Student Info Modal */}
      <StudentInfoModal open={showStudentInfo} onClose={() => setShowStudentInfo(false)} info={studentInfo || {}} />
      {/* Transcript and GPA Modals (if needed, or rendered inline) */}
       {/* These are now handled by rendering sections directly */}
      {/* Bottom Bar Navigation */}
      {bottomBar}
    </div>
  );
} 