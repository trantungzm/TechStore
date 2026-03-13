function ArticleDetail({article,onBack})
{
    if(!article) return null;
    return (
        <div className="card mt-3">
            <div className="card-body">
                <h3>{article.title}</h3>
                <p>{article.content}</p>
                <button className="btn btn-secondary" onClick=
                {
                  onBack
                }>Quay lại</button>
            </div>
        </div>
    );
}
export default ArticleDetail;