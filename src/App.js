import './App.css';
import Board from './runelink/board'
import Menu from './Menu'
import { BrowserRouter as Router, Switch,Route} from 'react-router-dom';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Menu />
        </Route>
        <Route path = "/:id" exact>
          <Board/>
        </Route>

      </Switch>
    </Router>
  );
}

export default App;
