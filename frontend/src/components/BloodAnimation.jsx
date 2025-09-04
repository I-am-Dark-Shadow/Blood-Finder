import React from 'react';
import './BloodAnimation.css'; // Amra ei CSS file-ti ekhon toiri korbo

const BloodAnimation = () => {
  return (
    <div className="blood-animation-background">
      {/* Ei div gulo blood droplet hisebe animate korbe */}
      <div className="blood-drop blood-drop-1"></div>
      <div className="blood-drop blood-drop-2"></div>
      <div className="blood-drop blood-drop-3"></div>
      <div className="blood-drop blood-drop-4"></div>
      <div className="blood-drop blood-drop-5"></div>
      <div className="blood-drop blood-drop-6"></div>
      <div className="blood-drop blood-drop-7"></div>
      <div className="blood-drop blood-drop-8"></div>
      <div className="blood-drop blood-drop-9"></div>
      <div className="blood-drop blood-drop-10"></div>
    </div>
  );
};

export default BloodAnimation;

