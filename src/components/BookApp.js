import { useState, useEffect } from "react";

function BookApp() {
	const [book, setBook] = useState(null);
	const [error, setError] = useState(null);
	const [shouldShowModal, setShouldShowModal] = useState(false);
	const [modalContent, setModalContent] = useState(undefined);
	const [currPage, setCurrPage] = useState(0);

	useEffect(() => {
		fetch("https://fullstack-engineer-test-n4ouilzfna-uc.a.run.app/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				query: `
                query books {
                    book {
                        pages {
                            pageIndex
                            content
                            tokens {
                                position
                                value
                            }
                        }
                    }
                }
                `,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				setBook(res.data.book);
			})
			.catch((err) => {
				setError(err);
			});
	}, []);

	if (!book) {
		return <div className={"card"}>loading</div>;
	}
	if (error) {
		return <div className={"card"}>{error.message}</div>;
	}

	const handleWordClick = (tokens, wordIndex) => {
		// to open the word modal

		const token = tokens.filter(({ position: [start, end], value }) => start === wordIndex)[0] ?? {};

		setShouldShowModal(true);
		setModalContent(token);
	};

	const closeDialog = () => setShouldShowModal(false);

	const ignoreClick = (e) => {
		e.stopPropagation();
		e.preventDefault();
	};

	// simple dialog to show the word

	const dialog = () => {
		return (
			<div className={"overlay"} onClick={closeDialog}>
				<div className={"modal-dialog"} onClick={ignoreClick}>
					<p>{modalContent?.value ?? "No content"}</p>
					<p className={"dismiss-message"}></p>
				</div>
			</div>
		);
	};

	// Pagination controls
	const thisPage = book?.pages[currPage] ?? {};

	const { pageIndex: firstPageNo, content, tokens } = thisPage;

	// get all the words in the page
	const words = content.split(" ");

	const canGoToPrev = () => currPage >= 2;

	const canGoToNext = () => book?.pages?.length - 2 > currPage;

	const goToPrevPage = () => {
		setCurrPage(currPage <= 1 ? 0 : currPage - 1);
	};

	const goToNextPage = () => {
		const finalPage = book?.pages?.length ? book?.pages?.length - 1 : 0;
		setCurrPage(currPage === finalPage ? finalPage : currPage + 1);
	};

	// The actual view
	return (
		<>
			{shouldShowModal ? dialog() : ""} {/*conditionally display modal dialog*/}
			<div className={"navigation"}>
				{firstPageNo !== 0 && (
					<button className={"nav-btn"} onClick={goToPrevPage} disabled={!canGoToPrev()}>
						Prev
					</button>
				)}

				{firstPageNo === 0 ? (
					<button className={"nav-btn"} onClick={goToNextPage} disabled={!canGoToNext()}>
						Start Your Journey..😎😎
					</button>
				) : (
					<span>Current page: {firstPageNo}</span>
				)}
				{firstPageNo !== 0 && (
					<button className={"nav-btn"} onClick={goToNextPage} disabled={!canGoToNext()}>
						Next
					</button>
				)}
			</div>
			{/* Book */}
			<div className="container">
				{firstPageNo !== 0 ? (
					<div className="card">
						<div className={"content"}>
							{words.map((word, index) => {
								return (
									<span
										className={"word"}
										style={{ cursor: "pointer" }}
										onClick={() => handleWordClick(tokens, content.indexOf(word))}
									>
										{word}
									</span>
								);
							})}
						</div>
					</div>
				) : (
					<img src="../images/read.jpg" alt="read" style={{ borderRadius: "50%" }} className="welcome" />
				)}
			</div>
		</>
	);
}

export default BookApp;
