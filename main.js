const API = "http://localhost:8000";

const getSearchParam = (searchParam) => {
  const params = new URLSearchParams(location.search);
  const param = params.get(searchParam);
  console.log("param:", param);
  return param;
};

const getProducts = async () => {
  try {
    const pageNumber = getSearchParam("page");
    const start = pageNumber ? (pageNumber - 1) * 5 : 0;

    const response = await fetch(`${API}/students?_limit=5&_start=${start}`);
    console.log("products response:", response);

    const total = response.headers.get("X-Total-Count");
    console.log("total: ", total);

    const data = await response.json();
    console.log("products data:", data);
    return data;
  } catch (error) {
    console.log("getProducts error:", error);
  }
};

// search
const searchStudents = async (searchParam) => {
  try {
    const response = await fetch(`${API}/students?q=${searchParam}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("searchStudents error:", error);
  }
};

const searchForm = document.querySelector(".navForm");
console.log(searchForm);
searchForm.addEventListener("submit", async (event) => {
  // выключаем дефолтное поведение формы
  event.preventDefault();

  // console.log("searchForm event:", event);

  const form = event.target; //что делает этот код?
  const searchInput = form.querySelector("input");
  const searchValue = searchInput.value;

  const products = await searchStudents(searchValue);
  console.log(products);
  render();
});

// burger
const burgerMenu = document.querySelector(".burgerMenu");
const navbar = document.querySelector(".navbar");
burgerMenu.addEventListener("click", () => {
  navbar.classList.toggle("active");
  burgerMenu.classList.toggle("active");
});

const form = document.querySelector(".inputsContainer form");
const input1 = document.querySelector("#firstName");
const input2 = document.querySelector("#lastName");
const input3 = document.querySelector("#number");
const input4 = document.querySelector("#weekResult");
const input5 = document.querySelector("#monthResult");
const saveBtn = document.querySelector("#button");
const tbody = document.querySelector(".tbody");

async function createProduct(newStudent) {
  try {
    await fetch(`${API}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudent),
    });
  } catch (error) {
    console.log(error);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let newStudent = {
    firstName: input1.value,
    lastName: input2.value,
    number: input3.value,
    weekResult: input4.value,
    monthResult: input5.value,
  };
  clearInputs();
  createProduct(newStudent);
  render();
});

render();

// Отображение студентов
async function render() {
  let response = await fetch(`${API}/students`);
  const data = await response.json();
  tbody.innerHTML = "";
  data.forEach((item) => {
    let tr = document.createElement("tr");
    tr.innerHTML += `
      <td>${item.firstName}</td>
      <td>${item.lastName}</td>
      <td>${item.number}</td>
      <td>${item.weekResult}</td>
      <td>${item.monthResult}</td>
      <td id="td_img_pos">
        <img onclick="getOneProduct(${item.id})" src="./assets/icons/edit_icon.png" alt="edit_icon" />
        <img onclick="deleteProduct(${item.id})" id="delete" src="./assets/icons/delete_icon.png" alt="delete_icon" />
      </td>
    `;
    tbody.append(tr);
  });
}
//todo: clear inputs
function clearInputs() {
  input1.value = "";
  input2.value = "";
  input3.value = "";
  input4.value = "";
  input5.value = "";
}

//! DELETE
async function deleteProduct(productId) {
  try {
    await fetch(`${API}/students/${productId}`, {
      method: "DELETE",
    });
    render();
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // 1) тут наши продукты с сервера
  const products = await getProducts();
  render(products);
});

//! EDIT
const editFirstName = document.querySelector("#editFirstName");
const editLastName = document.querySelector("#editLastName");
const editNumber = document.querySelector("#editNumber");
const editWeekResult = document.querySelector("#editWeekResult");
const editMonthResult = document.querySelector("#editMonthResult");

const editSave = document.querySelector("#editSave");
const btncancel = document.querySelector("#btncancel");
const editModal = document.querySelector(".modal");

console.log("editSave:", editSave);
console.log("btncancel:", btncancel);
console.log("editModal:", editModal);

const getOneProduct = async (productId) => {
  const result = await fetch(`${API}/students/${productId}`).then((data) =>
    data.json()
  );
  console.log(result);

  editModal.style.display = "block";

  editFirstName.value = result.firstName;
  editLastName.value = result.lastName;
  editNumber.value = result.number;
  editWeekResult.value = result.weekResult;
  editMonthResult.value = result.monthResult;
  id = result.id;
};

const editedProduct = async (id) => {
  const editedProduct = {
    firstName: editFirstName.value,
    lastName: editLastName.value,
    number: editNumber.value,
    weekResult: editWeekResult.value,
    monthResult: editMonthResult.value,
    id,
  };

  await fetch(`${API}/students/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(editedProduct),
  });
  render();
};

editSave.addEventListener("click", async () => {
  await editedProduct(id);
  editModal.style.display = "none";
});

btncancel.addEventListener("click", () => {
  editModal.style.display = "none";
});
//! Pagination

const paginationList = document.querySelector(".pagination");
const prev = document.querySelector("#prev");
const next = document.querySelector("#next");
let currentPage = 1;
let pageTotalCount = 0;

const renderPagination = () => {
  paginationList.innerHTML = "";
  for (let i = 1; i <= pageTotalCount; i++) {
    paginationList.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <button class="page-link page-number">${i}</button>
      </li>
    `;
  }
  renderPagination();

  if (currentPage <= 1) {
    prev.classList.add("disabled");
  } else {
    prev.classList.remove("disabled");
  }

  if (currentPage >= pageTotalCount) {
    next.classList.add("disabled");
  } else {
    next.classList.remove("disabled");
  }
};

next.addEventListener("click", () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render();
});

prev.addEventListener("click", () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  render();
});

prev.addEventListener("click", () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  render();
});

//! ____________________________
