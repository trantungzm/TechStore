import { useState } from "react";
import Navbar from "./components/Navbar";
import ArticleList from "./components/ArticleList";
import ArticleDetail from "./components/ArticleDetail";
import Home from "./pages/Home";
function App() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <>
      <Navbar />
      <Home />
      <div className="container mt-4">
        {!selectedArticle ? (
          <ArticleList onSelect={setSelectedArticle} />
        ) : (
          <ArticleDetail
            article={selectedArticle}
            onBack={() => setSelectedArticle(null)}
          />
        )}
      </div>
    </>
  );
}

export default App;
