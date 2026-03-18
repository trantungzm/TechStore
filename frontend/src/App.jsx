
import { useState } from "react";

import Navbar from "./components/Navbar";
import ArticleList from "./components/ArticleList";
import ArticleDetail from "./components/ArticleDetail";
import Home from "./pages/Home";
function App() {
 // const [selectedArticle, setSelectedArticle] = useState(null);
    const [count,getCount] = useState(0);
  return (
       <button onClick={()=> getCount(count + 9)}>
        Count:{count}
       </button>
       
  );
}


export default App;
