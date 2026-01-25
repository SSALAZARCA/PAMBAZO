console.log('TEST.JS IS WORKING!');

// Hide loading screen
const loading = document.getElementById('loading');
if (loading) {
  loading.style.display = 'none';
  console.log('Loading hidden by test.js');
}

// Add content to root
const root = document.getElementById('root');
if (root) {
  root.innerHTML = `
    <div style="
      min-height: 100vh;
      background: linear-gradient(135deg, #fef7ed, #fef3c7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
    ">
      <div style="text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🥖</div>
        <h1 style="font-size: 2.5rem; font-weight: bold; color: #9a3412; margin-bottom: 0.5rem;">PAMBAZO</h1>
        <p style="color: #ea580c; font-size: 1.2rem;">¡JavaScript básico funcionando!</p>
        <div style="
          margin-top: 1.5rem;
          padding: 1rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        ">
          <p style="color: #374151;">Test.js cargado exitosamente</p>
        </div>
      </div>
    </div>
  `;
  console.log('Content added to root by test.js');
} else {
  console.log('Root element not found by test.js');
}