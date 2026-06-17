import React from 'react';
import useGoodreads from '../hooks/useGoodreads';
import { goodreadsData } from '../data/goodreadsData';

const GoodreadsPreview = () => {
  const { books, loading, error } = useGoodreads();

  if (error) {
    return (
      <p className="cf-preview-msg cf-error-msg">
        {goodreadsData.messages.error} {error}
      </p>
    );
  }

  if (loading) {
    return <p className="cf-preview-msg cf-loading-msg">{goodreadsData.messages.loading}</p>;
  }

  return (
    <div className="gr-preview">
      {books.length === 0 ? (
        <p className="cf-preview-msg">{goodreadsData.messages.empty}</p>
      ) : (
        <ul className="gr-list">
          {books.map((book) => (
            <li className="gr-book" key={book.id || book.title}>
              {book.cover && (
                <img
                  className="gr-cover"
                  src={book.cover}
                  alt=""
                  loading="lazy"
                  width="44"
                />
              )}
              <div className="gr-book-info">
                <a
                  className="gr-book-title"
                  href={book.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {book.title}
                </a>
                {book.author && <span className="gr-book-author">{book.author}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="gr-preview-foot">
        <a
          href={goodreadsData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="cf-profile-link"
          aria-label={`${goodreadsData.handle} on Goodreads`}
        >
          {goodreadsData.handle}
        </a>
      </div>
    </div>
  );
};

export default GoodreadsPreview;
