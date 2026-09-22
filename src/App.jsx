import StarField from './components/StarField.jsx';
import RingVisual from './components/RingVisual.jsx';

export default function App() {
  return (
    <div className="app-root">
      <StarField />
      <div className="deep-space-gradient" />
      <div className="milky-way" />
      <div className="ring-wrapper">
        <RingVisual />
      </div>
    </div>
  );
}
