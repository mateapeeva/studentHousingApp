import Navbar from './Navbar';
import React from 'react';
import { Outlet } from 'react-router-dom';
import './DashboardLayout.css'; 

export default function(){
    return(
        <div className="dashboard-layout">
            <div className="navbar-layout">
                <Navbar  />
            </div>
            <main className='dashboard-content-layout'>
                <Outlet />
            </main>
        </div>
    );
}