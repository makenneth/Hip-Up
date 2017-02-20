module.exports = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)'
  },
  content: {
    position: 'absolute',
    margin: "0 auto",
    top: "50%",
    transform: "translateY(-50%)",
    width: '400px',
    maxHeight: '80vh',
    height: '50%',
    maxHeight: '530px',
    border: '1px solid #ccc',
    opacity: '0.9',
    background: '#000',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '10px',
    padding: '25px'
  }
};