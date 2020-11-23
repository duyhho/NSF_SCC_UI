import React from "react";
// import './AnimalCard.css'

export default function Test() {
  return (
    <form onSubmit={this.onFormSubmit}>
      <h1>File Upload</h1>
      <input type="file" onChange={this.onChange} />
      <button type="submit">Upload</button>
    </form>
  );
}
