// ELement Variable
const bookFormInputs = document.querySelectorAll('.input-group-wrapper input');
const bookForm = document.getElementById('bookForm');
const bookFormIsComplete = document.getElementById('bookFormIsComplete');
let booksCard = document.querySelectorAll('article');
const bookFormSubmit = document.getElementById('bookFormSubmit');
const bookListWrapper = document.querySelectorAll('.book-list-wrapper');
const btnCancelEdit = document.querySelector('.btn-cancel-edit');
const searchBookForm = document.getElementById('searchBook');

// Event Variable
const RENDER_EVENT = 'render-book-event';
const renderBookEvent = new Event(RENDER_EVENT);

// Local Storage Variable
const bookStorageKey = 'BOOK_STORAGE_KEY';

const bookLists = !localStorage.getItem(bookStorageKey) ? [] : JSON.parse(localStorage.getItem(bookStorageKey));

const url = new URL(window.location.href);

document.addEventListener('DOMContentLoaded', () => {

    url.search = '';
    window.history.replaceState({}, '', url);

    if (typeof Storage !== undefined) {
        
        if (localStorage.getItem(bookStorageKey) === null) {
            localStorage.setItem(bookStorageKey, JSON.stringify([]));
        }

        document.dispatchEvent(renderBookEvent);        

    }else{
        alert('maaf browser anda tidak mendukung fitur Storage, mohon gunakan browser lain')
    }

});

// Render List Book
document.addEventListener(RENDER_EVENT, () => {

    bookListWrapper.forEach((wrapper) => {
        wrapper.innerHTML = '';
    });
    
    let bookStorage = !localStorage.getItem(bookStorageKey) ? [] : JSON.parse(localStorage.getItem(bookStorageKey));

    if (url.searchParams.has('keyword')) {
        bookStorage = bookStorage.filter((value) => value.title.toLowerCase().includes(url.searchParams.get('keyword').toLowerCase()));
    }

    if (bookStorage.length > 0) {    
        
        bookStorage.map((value) => {
            
            const bookElement = `
                <article data-bookid="${value.id}" data-testid="bookItem">
                    <div class="top">
                        <h3 data-testid="bookItemTitle">${value.title}</h3>
                    </div>
                    <div class="book-content">
                        <p data-testid="bookItemAuthor">
                            <span>Penulis</span>
                            ${value.author}
                        </p>
                        <p data-testid="bookItemYear">
                            <span>Tahun</span>
                            ${value.year}
                        </p>
                        <div class="action-button">
                            <button class="delete-button" data-testid="bookItemDeleteButton">Hapus Buku</button>
                            <button class="edit-button" data-testid="bookItemEditButton">Edit Buku</button>
                        </div>
                        <button class="is-complete ${value.isComplete ? 'true' : 'false'}" data-testid="bookItemIsCompleteButton">${value.isComplete ? 'Belum Selesai Dibaca' : 'Selesai Dibaca'}</button>
                    </div>
                </article>
            `;

            if (value.isComplete) {
                bookListWrapper[1].innerHTML += bookElement;
            }else{
                bookListWrapper[0].innerHTML += bookElement;
            }
        })
        
    }else{
        bookListWrapper.forEach((wrapper, index) => {
            wrapper.innerHTML = '<p>Tidak Ada Data Buku</p>'
        })
    }

    bookListWrapper.forEach((wrapper, index) => {
        if (wrapper.children.length < 1) {
            wrapper.innerHTML = '<p>Tidak Ada Data Buku</p>'
        }
    })

    deleteBookHandler();
    moveBookHandler();
    editBookHandler();
    searchBookHandler();
})

// Submit Form Book Function Handler
// Format Object
// {
//     id: string | number,
//     title: string,
//     author: string,
//     year: number,
//     isComplete: boolean,
// }
bookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (url.searchParams.has('id')) {
        const bookTarget = JSON.parse(localStorage.getItem(bookStorageKey)).findIndex((obj) => obj.id == url.searchParams.get('id'));
        
        bookLists[bookTarget].title = bookFormInputs[0].value;
        bookLists[bookTarget].author = bookFormInputs[1].value;
        bookLists[bookTarget].year = Number(bookFormInputs[2].value);
        bookLists[bookTarget].isComplete = bookFormIsComplete.checked ? true : false;

        url.searchParams.delete('id');

        bookForm.reset();

        window.history.pushState({}, '', url);

        btnCancelEdit.style.display = 'none';
        bookFormSubmit.innerHTML = 'Masukkan Buku ke rak&nbsp;<span>( Belum selesai dibaca )</span>';

    }else{
        bookLists.push({
            id: new Date().getTime(),
            title: bookFormInputs[0].value,
            author: bookFormInputs[1].value,
            year: Number(bookFormInputs[2].value),
            isComplete: bookFormIsComplete.checked ? true : false
        });
    }

    localStorage.setItem(bookStorageKey, JSON.stringify(bookLists));

    document.dispatchEvent(renderBookEvent);

    bookForm.reset();
});

// Get Single Book (return index)
function getSingleBook(book){
    const id = book.getAttribute('data-bookid');        
    const bookTarget = JSON.parse(localStorage.getItem(bookStorageKey)).findIndex((obj) => obj.id == id);

    return bookTarget;
}

// Delete Book Function Handler
function deleteBookHandler(){

    booksCard = document.querySelectorAll('article');

    booksCard.forEach((book) => {
        book.querySelector('.delete-button').onclick = () => {
            
            const bookTarget = getSingleBook(book);
            
            bookLists.splice(bookTarget, 1);

            localStorage.setItem(bookStorageKey, JSON.stringify(bookLists));

            document.dispatchEvent(renderBookEvent);
        }
    })
}

// Move Book to complete/incomplete read
function moveBookHandler(){

    booksCard = document.querySelectorAll('article');

    booksCard.forEach((book) => {
        book.querySelector('.is-complete').onclick = (el) => {

            const bookTarget = getSingleBook(book);

            bookLists[bookTarget].isComplete = el.target.classList.contains('false') ? true : false;

            localStorage.setItem(bookStorageKey, JSON.stringify(bookLists));

            document.dispatchEvent(renderBookEvent);

        }
    })
}

// Edit Book
function editBookHandler(){
    booksCard = document.querySelectorAll('article');

    booksCard.forEach((book) => {
        book.querySelector('.edit-button').onclick = (el) => {

            const bookTarget = getSingleBook(book);

            bookFormInputs[0].value = bookLists[bookTarget].title;
            bookFormInputs[1].value = bookLists[bookTarget].author;
            bookFormInputs[2].value = bookLists[bookTarget].year;
            bookFormIsComplete.checked = bookLists[bookTarget].isComplete;

            url.searchParams.set('id', bookLists[bookTarget].id);
            window.history.pushState({}, '', url);

            btnCancelEdit.style.display = 'flex';
            bookFormSubmit.innerHTML = 'Update Buku&nbsp;<span>( Belum selesai dibaca )</span>';
        }
    })

    btnCancelEdit.onclick = () => {
        url.searchParams.delete('id');

        bookForm.reset();

        window.history.pushState({}, '', url);

        btnCancelEdit.style.display = 'none';
        bookFormSubmit.innerHTML = 'Masukkan Buku ke rak&nbsp;<span>( Belum selesai dibaca )</span>';
    };
    
}

// Search Book
function searchBookHandler(){
    searchBookForm.onsubmit = (e) => {
        e.preventDefault();
        
        const input = e.target.querySelector('input');

        url.searchParams.set('keyword', input.value);
        window.history.pushState({}, '', url);
        
        document.dispatchEvent(renderBookEvent);
    }

    searchBookForm.querySelector('input').addEventListener('input', (e) => {
        if (e.target.value == '') {
            url.searchParams.delete('keyword');
            window.history.pushState({}, '', url);
            document.dispatchEvent(renderBookEvent);
        }
    })
}

// complete read toggle/checkbox
bookFormIsComplete.addEventListener('change', (checkbox) => bookFormSubmit.querySelector('span').innerText = checkbox.target.checked ? '( Sudah selesai dibaca )' : '( Belum selesai dibaca )');


