import React from 'react';
import { Link } from 'react-router-dom';

export default class NotFound extends React.Component {
    render() {
        return (
            <div className="page-container" align="center">
                <h1>Page Not Found!</h1>
                <Link to="/">
                    Go Home
                </Link>
            </div>
        )
    }
}