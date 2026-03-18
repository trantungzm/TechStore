import articles from "../data/articles";
function ArticleList({onSelect}){
     return (
      <div className="row">
          {articles.map(
            article =>(
                <div className="col-md-4 mb-3" key={article.id}>
                     <div className="card h-100">
                        <div className="card-body">
                            <h5>{article.title}</h5>
                            <p className="text-muted">{article.category}</p>
                            <button className="btn btn-primary" onClick=
                            {() => onSelect(article)}>Xem chi tiết</button>
                            </div>
                        </div>
                </div>
            )
          )
          }
      </div>
     );
    }
    export default ArticleList;