import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentView } from './components/StudentView';
import { AppState } from './types';

function App() {
  const [currentView, setCurrentView] = useState<AppState>(AppState.HOME);

  const handleRoleSelect = (role: 'TEACHER' | 'STUDENT') => {
    setCurrentView(role === 'TEACHER' ? AppState.TEACHER : AppState.STUDENT);
  };

  const handleBack = () => {
    setCurrentView(AppState.HOME);
  };

  return (
    <div className="antialiased text-slate-900">
      {currentView === AppState.HOME && (
        <HomePage onSelectRole={handleRoleSelect} />
      )}
      {currentView === AppState.TEACHER && (
        <TeacherDashboard onBack={handleBack} />
      )}
      {currentView === AppState.STUDENT && (
        <StudentView onBack={handleBack} />
      )}
    </div>
  );
}

export default App;