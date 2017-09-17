import React from 'react'
import './HomeView.scss'
import { IndexLink, Link } from 'react-router'

export const HomeView = () => (
  <div>
    <h1>Welcome!</h1>
    <Link to='counter'>Go To Counter Example</Link>
  </div>
)

export default HomeView
