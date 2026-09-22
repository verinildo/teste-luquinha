/* ============================================================
   1. LOCAIS
============================================================ */

const LOCATIONS = {
  cantina: {
    name: "Cantina",
    color: "#6380ff"
  },

  lojinha: {
    name: "Lojinha",
    color: "#18b790"
  },

  secretaria: {
    name: "Secretaria",
    color: "#f6b84d"
  },

  eventos: {
    name: "Eventos",
    color: "#c26ef5"
  },

  estacionamento: {
    name: "Estacionamento",
    color: "#f06d83"
  },

  outros: {
    name: "Outros",
    color: "#57a7db"
  }
};


/* ============================================================
   2. CATEGORIAS
============================================================ */

const CATEGORIES = {
  geral: "GERAL",
  reset: "RESET",
  resetTeens: "RESET Teens"
};


/* ============================================================
   3. LOCAL STORAGE
============================================================ */

const STORAGE_KEY =
  "controleFinanceiroMovimentosV1";


/* ============================================================
   4. VARIÁVEIS PRINCIPAIS
============================================================ */

let transactions =
  loadTransactions();

let currentLocal =
  "cantina";

let currentReportData =
  [];


/* ============================================================
   5. CONTROLE DE EDIÇÃO
============================================================ */

/*
Se for null:
estamos criando um novo lançamento.

Se possuir um ID:
estamos editando um lançamento existente.
*/

let editingTransactionId =
  null;


/* ============================================================
   6. GRÁFICOS
============================================================ */

let locationChart =
  null;

let monthlyChart =
  null;

let generalCategoryChart =
  null;

let resetCategoryChart =
  null;

let resetTeensCategoryChart =
  null;


/* ============================================================
   7. FORMATAÇÃO DE DINHEIRO
============================================================ */

const money =
  new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );


/* ============================================================
   8. ATALHOS
============================================================ */

function $(selector) {
  return document.querySelector(selector);
}


function $all(selector) {
  return [
    ...document.querySelectorAll(selector)
  ];
}


/* ============================================================
   9. DATA ATUAL
============================================================ */

function todayISO() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}


/* ============================================================
   10. FORMATAR DATA
============================================================ */

function formatDate(iso) {

  if (!iso) {
    return "—";
  }

  const [
    year,
    month,
    day
  ] = iso.split("-");

  return `${day}/${month}/${year}`;
}


/* ============================================================
   11. GERAR ID
============================================================ */

function uid() {

  return (
    `${Date.now()}-`
    +
    Math.random()
      .toString(16)
      .slice(2)
  );

}


/* ============================================================
   12. CARREGAR LANÇAMENTOS
============================================================ */

function loadTransactions() {

  try {

    return (
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEY
        )
      )
      ||
      []
    );

  }

  catch {

    return [];

  }

}


/* ============================================================
   13. SALVAR LANÇAMENTOS
============================================================ */

function saveTransactions() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      transactions
    )
  );

}


/* ============================================================
   14. CALCULAR TOTAIS
============================================================ */

function totals(list) {

  const income =
    list
      .filter(
        transaction =>
          transaction.type === "entrada"
      )
      .reduce(
        (total, transaction) =>
          total
          +
          Number(
            transaction.value
          ),
        0
      );


  const expense =
    list
      .filter(
        transaction =>
          transaction.type === "saida"
      )
      .reduce(
        (total, transaction) =>
          total
          +
          Number(
            transaction.value
          ),
        0
      );


  return {
    income,
    expense,
    balance:
      income - expense,
    count:
      list.length
  };

}


/* ============================================================
   15. MOSTRAR VALOR EM DINHEIRO
============================================================ */

function setMoney(
  element,
  value,
  balanceAware = false
) {

  if (!element) {
    return;
  }


  element.textContent =
    money.format(value);


  if (balanceAware) {

    element.classList.remove(
      "positive",
      "negative"
    );


    if (value > 0) {

      element.classList.add(
        "positive"
      );

    }


    if (value < 0) {

      element.classList.add(
        "negative"
      );

    }

  }

}


/* ============================================================
   16. TOAST
============================================================ */

function showToast(message) {

  const toast =
    $("#toast");


  if (!toast) {

    console.log(message);

    return;

  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    showToast.timer
  );


  showToast.timer =
    setTimeout(
      () =>
        toast.classList.remove(
          "show"
        ),
      2400
    );

}


/* ============================================================
   17. NAVEGAÇÃO
============================================================ */

function navigate(
  page,
  local = null
) {

  $all(".page")
    .forEach(
      element =>
        element.classList.remove(
          "active"
        )
    );


  $all(".menu-item")
    .forEach(
      element =>
        element.classList.remove(
          "active"
        )
    );


  /* DASHBOARD */

  if (page === "dashboard") {

    $("#dashboardPage")
      .classList.add(
        "active"
      );


    $('[data-page="dashboard"]')
      .classList.add(
        "active"
      );


    $("#pageTitle")
      .textContent =
      "Visão geral";


    renderDashboard();

  }


  /* LOCAL */

  if (page === "local") {

    currentLocal =
      local
      ||
      currentLocal;


    $("#localPage")
      .classList.add(
        "active"
      );


    const menuItem =
      $(
        `[data-page="local"][data-local="${currentLocal}"]`
      );


    if (menuItem) {

      menuItem.classList.add(
        "active"
      );

    }


    $("#pageTitle")
      .textContent =
      LOCATIONS[
        currentLocal
      ].name;


    renderLocalPage();

  }


  /* RELATÓRIOS */

  if (page === "reports") {

    $("#reportsPage")
      .classList.add(
        "active"
      );


    $('[data-page="reports"]')
      .classList.add(
        "active"
      );


    $("#pageTitle")
      .textContent =
      "Relatórios";


    generateReport();

  }


  $("#sidebar")
    .classList.remove(
      "open"
    );

}


/* ============================================================
   18. DASHBOARD
============================================================ */

function renderDashboard() {

  const all =
    totals(
      transactions
    );


  setMoney(
    $("#totalIncome"),
    all.income
  );


  setMoney(
    $("#totalExpense"),
    all.expense
  );


  setMoney(
    $("#totalBalance"),
    all.balance,
    true
  );


  $("#transactionCount")
    .textContent =
    all.count;


  renderLocationSummary();

  renderRecentTransactions();

  renderCharts();

}


/* ============================================================
   19. RESUMO DOS LOCAIS
============================================================ */

function renderLocationSummary() {

  const container =
    $("#locationsSummary");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  Object.entries(
    LOCATIONS
  )
    .forEach(
      ([key, location]) => {

        const list =
          transactions.filter(
            transaction =>
              transaction.location
              ===
              key
          );


        const result =
          totals(list);


        const row =
          document.createElement(
            "div"
          );


        row.className =
          "location-row";


        row.dataset.local =
          key;


        row.innerHTML = `

          <div class="location-row-top">

            <strong>
              ${location.name}
            </strong>

            <span
              class="dot"
              style="
                background:
                ${location.color}
              "
            ></span>

          </div>


          <div class="location-row-bottom">

            <small>

              ${result.count}

              lançamento${
                result.count === 1
                  ? ""
                  : "s"
              }

            </small>


            <strong
              class="${
                result.balance > 0
                  ? "positive"
                  :
                result.balance < 0
                  ? "negative"
                  :
                  ""
              }"
            >

              ${money.format(
                result.balance
              )}

            </strong>

          </div>

        `;


        row.addEventListener(
          "click",
          () =>
            navigate(
              "local",
              key
            )
        );


        container.appendChild(
          row
        );

      }
    );

}


/* ============================================================
   20. ÚLTIMOS LANÇAMENTOS
============================================================ */

function renderRecentTransactions() {

  const container =
    $("#recentTransactions");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  const recent =
    [...transactions]
      .sort(
        (a, b) =>
          b.date.localeCompare(
            a.date
          )
          ||
          b.createdAt
          -
          a.createdAt
      )
      .slice(
        0,
        7
      );


  if (!recent.length) {

    container.innerHTML = `

      <div class="empty-state">

        Nenhum lançamento registrado.

      </div>

    `;

    return;

  }


  recent.forEach(
    transaction => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "mini-row";


      row.innerHTML = `

        <div class="meta">

          <strong>

            ${escapeHtml(
              transaction.description
            )}

          </strong>


          <small>

            ${
              LOCATIONS[
                transaction.location
              ]?.name
              ||
              transaction.location
            }

            •

            ${formatDate(
              transaction.date
            )}

            •

            ${
              transaction.category
              ||
              "GERAL"
            }

          </small>

        </div>


        <strong
          class="${
            transaction.type
            ===
            "entrada"
              ? "positive"
              : "negative"
          }"
        >

          ${
            transaction.type
            ===
            "entrada"
              ? "+"
              : "−"
          }

          ${money.format(
            transaction.value
          )}

        </strong>

      `;


      container.appendChild(
        row
      );

    }
  );

}


/* ============================================================
   21. GRÁFICOS
============================================================ */

function renderCharts() {

  if (
    typeof Chart
    ===
    "undefined"
  ) {

    return;

  }


  /* ==========================================================
     GRÁFICO POR LOCAL
  ========================================================== */

  const locationCanvas =
    $("#locationChart");


  if (locationCanvas) {

    const labels =
      Object.values(
        LOCATIONS
      )
        .map(
          location =>
            location.name
        );


    const incomes =
      Object.keys(
        LOCATIONS
      )
        .map(
          key =>
            totals(
              transactions.filter(
                transaction =>
                  transaction.location
                  ===
                  key
              )
            ).income
        );


    const expenses =
      Object.keys(
        LOCATIONS
      )
        .map(
          key =>
            totals(
              transactions.filter(
                transaction =>
                  transaction.location
                  ===
                  key
              )
            ).expense
        );


    if (locationChart) {

      locationChart.destroy();

    }


    locationChart =
      new Chart(
        locationCanvas,
        {
          type: "bar",

          data: {

            labels,

            datasets: [

              {
                label:
                  "Entradas",

                data:
                  incomes,

                backgroundColor:
                  "rgba(12,155,106,.75)",

                borderRadius:
                  7
              },


              {
                label:
                  "Saídas",

                data:
                  expenses,

                backgroundColor:
                  "rgba(223,75,95,.72)",

                borderRadius:
                  7
              }

            ]

          },

          options:
            commonChartOptions()

        }
      );

  }


  /* ==========================================================
     GRÁFICO MENSAL
  ========================================================== */

  const monthlyCanvas =
    $("#monthlyChart");


  if (monthlyCanvas) {

    const monthMap =
      {};


    transactions.forEach(
      transaction => {

        if (!transaction.date) {
          return;
        }


        const month =
          transaction.date
            .slice(
              0,
              7
            );


        monthMap[month]
          ||= {
            entrada: 0,
            saida: 0
          };


        monthMap[
          month
        ][
          transaction.type
        ]
          +=
          Number(
            transaction.value
          );

      }
    );


    const monthKeys =
      Object.keys(
        monthMap
      )
        .sort()
        .slice(-12);


    const monthLabels =
      monthKeys.map(
        key => {

          const [
            year,
            month
          ] =
            key.split("-");


          return (
            `${month}/${year.slice(2)}`
          );

        }
      );


    if (monthlyChart) {

      monthlyChart.destroy();

    }


    monthlyChart =
      new Chart(
        monthlyCanvas,
        {
          type:
            "line",

          data: {

            labels:
              monthLabels.length
                ?
                monthLabels
                :
                [
                  new Date()
                    .toLocaleDateString(
                      "pt-BR",
                      {
                        month:
                          "2-digit",

                        year:
                          "2-digit"
                      }
                    )
                ],


            datasets: [

              {
                label:
                  "Entradas",

                data:
                  monthKeys.length
                    ?
                    monthKeys.map(
                      key =>
                        monthMap[
                          key
                        ].entrada
                    )
                    :
                    [0],

                borderColor:
                  "#0c9b6a",

                backgroundColor:
                  "rgba(12,155,106,.08)",

                tension:
                  .35,

                fill:
                  true
              },


              {
                label:
                  "Saídas",

                data:
                  monthKeys.length
                    ?
                    monthKeys.map(
                      key =>
                        monthMap[
                          key
                        ].saida
                    )
                    :
                    [0],

                borderColor:
                  "#df4b5f",

                backgroundColor:
                  "rgba(223,75,95,.06)",

                tension:
                  .35,

                fill:
                  true
              }

            ]

          },

          options:
            commonChartOptions()

        }
      );

  }


  /* ==========================================================
     GERAL

     IMPORTANTE:

     GERAL recebe todos os lançamentos.

     Logo:

     GERAL
     +
     RESET
     +
     RESET Teens
  ========================================================== */

  generalCategoryChart =
    renderCategoryChart(
      generalCategoryChart,
      "#generalCategoryChart",
      transactions
    );


  /* ==========================================================
     RESET
  ========================================================== */

  const resetTransactions =
    transactions.filter(
      transaction =>
        transaction.category
        ===
        CATEGORIES.reset
    );


  resetCategoryChart =
    renderCategoryChart(
      resetCategoryChart,
      "#resetCategoryChart",
      resetTransactions
    );


  /* ==========================================================
     RESET TEENS
  ========================================================== */

  const resetTeensTransactions =
    transactions.filter(
      transaction =>
        transaction.category
        ===
        CATEGORIES.resetTeens
    );


  resetTeensCategoryChart =
    renderCategoryChart(
      resetTeensCategoryChart,
      "#resetTeensCategoryChart",
      resetTeensTransactions
    );

}


/* ============================================================
   22. GRÁFICO DE CATEGORIA
============================================================ */

function renderCategoryChart(
  existingChart,
  canvasSelector,
  transactionList
) {

  const canvas =
    $(canvasSelector);


  if (!canvas) {

    return existingChart;

  }


  const labels =
    Object.values(
      LOCATIONS
    )
      .map(
        location =>
          location.name
      );


  /* ENTRADAS */

  const incomes =
    Object.keys(
      LOCATIONS
    )
      .map(
        locationKey => {

          const localTransactions =
            transactionList.filter(
              transaction =>
                transaction.location
                ===
                locationKey
            );


          return (
            totals(
              localTransactions
            ).income
          );

        }
      );


  /* SAÍDAS */

  const expenses =
    Object.keys(
      LOCATIONS
    )
      .map(
        locationKey => {

          const localTransactions =
            transactionList.filter(
              transaction =>
                transaction.location
                ===
                locationKey
            );


          return (
            totals(
              localTransactions
            ).expense
          );

        }
      );


  if (existingChart) {

    existingChart.destroy();

  }


  return new Chart(
    canvas,
    {
      type:
        "bar",

      data: {

        labels,

        datasets: [

          {
            label:
              "Entradas",

            data:
              incomes,

            backgroundColor:
              "rgba(12,155,106,.75)",

            borderRadius:
              7
          },


          {
            label:
              "Saídas",

            data:
              expenses,

            backgroundColor:
              "rgba(223,75,95,.72)",

            borderRadius:
              7
          }

        ]

      },

      options:
        commonChartOptions()

    }
  );

}


/* ============================================================
   23. CONFIGURAÇÃO DOS GRÁFICOS
============================================================ */

function commonChartOptions() {

  return {

    responsive:
      true,

    maintainAspectRatio:
      false,


    plugins: {

      legend: {

        labels: {

          usePointStyle:
            true,

          boxWidth:
            8,

          font: {
            size:
              11
          }

        }

      },


      tooltip: {

        callbacks: {

          label:
            context =>
              `${
                context.dataset.label
              }: ${
                money.format(
                  context.raw
                  ||
                  0
                )
              }`

        }

      }

    },


    scales: {

      x: {

        grid: {
          display:
            false
        },

        ticks: {

          color:
            "#7b8495",

          font: {
            size:
              10
          }

        }

      },


      y: {

        beginAtZero:
          true,

        grid: {
          color:
            "rgba(120,130,150,.12)"
        },

        ticks: {

          color:
            "#7b8495",

          font: {
            size:
              10
          },

          callback:
            value =>
              "R$ "
              +
              Number(
                value
              )
                .toLocaleString(
                  "pt-BR"
                )

        }

      }

    }

  };

}


/* ============================================================
   24. PÁGINA DO LOCAL
============================================================ */

function renderLocalPage() {

  const location =
    LOCATIONS[
      currentLocal
    ];


  if (!location) {
    return;
  }


  const localSearch =
    $("#localSearch");


  const search =
    (
      localSearch?.value
      ||
      ""
    )
      .toLowerCase();


  /* TODOS OS LANÇAMENTOS DO LOCAL */

  const allLocal =
    transactions.filter(
      transaction =>
        transaction.location
        ===
        currentLocal
    );


  /* FILTRO DA BUSCA */

  const filtered =
    allLocal.filter(
      transaction => {

        const description =
          (
            transaction.description
            ||
            ""
          )
            .toLowerCase();


        const category =
          (
            transaction.category
            ||
            ""
          )
            .toLowerCase();


        return (
          description.includes(
            search
          )
          ||
          category.includes(
            search
          )
        );

      }
    );


  if ($("#localBadge")) {

    $("#localBadge")
      .textContent =
      "Local financeiro";

  }


  if ($("#localHeading")) {

    $("#localHeading")
      .textContent =
      location.name;

  }


  /* CARDS */

  const result =
    totals(
      allLocal
    );


  setMoney(
    $("#localIncome"),
    result.income
  );


  setMoney(
    $("#localExpense"),
    result.expense
  );


  setMoney(
    $("#localBalance"),
    result.balance,
    true
  );


  if ($("#localCount")) {

    $("#localCount")
      .textContent =
      result.count;

  }


  /* TABELA */

  const tbody =
    $("#localTransactionsTable");


  if (!tbody) {
    return;
  }


  tbody.innerHTML =
    "";


  if (!filtered.length) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="empty-state"
        >

          Nenhum lançamento encontrado.

        </td>

      </tr>

    `;

    return;

  }


  [...filtered]

    .sort(
      (a, b) =>
        b.date.localeCompare(
          a.date
        )
        ||
        b.createdAt
        -
        a.createdAt
    )

    .forEach(
      transaction => {

        const row =
          document.createElement(
            "tr"
          );


        row.innerHTML = `

          <td>

            ${formatDate(
              transaction.date
            )}

          </td>


          <td>

            ${escapeHtml(
              transaction.description
            )}

          </td>


          <td>

            ${escapeHtml(
              transaction.category
              ||
              "GERAL"
            )}

          </td>


          <td>

            <span
              class="
                badge
                ${
                  transaction.type
                  ===
                  "entrada"
                    ?
                    "badge-income"
                    :
                    "badge-expense"
                }
              "
            >

              ${
                transaction.type
                ===
                "entrada"
                  ?
                  "Entrada"
                  :
                  "Saída"
              }

            </span>

          </td>


          <td
            class="${
              transaction.type
              ===
              "entrada"
                ?
                "positive"
                :
                "negative"
            }"
          >

            <strong>

              ${money.format(
                transaction.value
              )}

            </strong>

          </td>


          <td>

            <div class="action-buttons">

              <!-- EDITAR -->

              <button
                class="edit-btn"
                data-edit-id="${transaction.id}"
                title="Editar lançamento"
              >

                Editar

              </button>


              <!-- EXCLUIR -->

              <button
                class="delete-btn"
                data-delete-id="${transaction.id}"
                title="Excluir lançamento"
              >

                Excluir

              </button>

            </div>

          </td>

        `;


        tbody.appendChild(
          row
        );

      }
    );

}


/* ============================================================
   25. ABRIR NOVO LANÇAMENTO
============================================================ */

function openTransactionModal(
  location = null
) {

  /* Não estamos editando */

  editingTransactionId =
    null;


  /* Limpar formulário */

  $("#transactionForm")
    .reset();


  /* Título do modal */

  if (
    $("#transactionModalTitle")
  ) {

    $("#transactionModalTitle")
      .textContent =
      "Novo lançamento";

  }


  /* Botão salvar */

  if (
    $("#saveTransactionBtn")
  ) {

    $("#saveTransactionBtn")
      .textContent =
      "Salvar lançamento";

  }


  /* Data */

  $("#transactionDate")
    .value =
    todayISO();


  /* Local */

  $("#transactionLocation")
    .value =
    location
    ||
    currentLocal
    ||
    "cantina";


  /* Tipo */

  $("#transactionType")
    .value =
    "entrada";


  /* Categoria */

  $("#transactionCategory")
    .value =
    CATEGORIES.geral;


  /* Abrir */

  $("#transactionDialog")
    .showModal();


  /* Focar na descrição */

  setTimeout(
    () =>
      $("#transactionDescription")
        .focus(),
    50
  );

}


/* ============================================================
   26. ABRIR EDIÇÃO
============================================================ */

function openEditTransactionModal(id) {

  /* Procurar lançamento */

  const transaction =
    transactions.find(
      item =>
        item.id
        ===
        id
    );


  if (!transaction) {

    showToast(
      "Lançamento não encontrado."
    );

    return;

  }


  /* Informar que estamos editando */

  editingTransactionId =
    id;


  /* Título */

  if (
    $("#transactionModalTitle")
  ) {

    $("#transactionModalTitle")
      .textContent =
      "Editar lançamento";

  }


  /* Texto do botão */

  if (
    $("#saveTransactionBtn")
  ) {

    $("#saveTransactionBtn")
      .textContent =
      "Salvar alterações";

  }


  /* ==========================================================
     PREENCHER FORMULÁRIO
  ========================================================== */

  $("#transactionLocation")
    .value =
    transaction.location;


  $("#transactionType")
    .value =
    transaction.type;


  $("#transactionDescription")
    .value =
    transaction.description
    ||
    "";


  /* ==========================================================
     CATEGORIA

     Caso seja um lançamento antigo que tinha
     "brinquedo", "venda" ou qualquer outra categoria,
     ele será mostrado como GERAL na edição.
  ========================================================== */

  const validCategories = [
    CATEGORIES.geral,
    CATEGORIES.reset,
    CATEGORIES.resetTeens
  ];


  $("#transactionCategory")
    .value =
    validCategories.includes(
      transaction.category
    )
      ?
      transaction.category
      :
      CATEGORIES.geral;


  $("#transactionValue")
    .value =
    transaction.value;


  $("#transactionDate")
    .value =
    transaction.date;


  $("#transactionPayment")
    .value =
    transaction.payment
    ||
    "Pix";


  $("#transactionNotes")
    .value =
    transaction.notes
    ||
    "";


  /* Abrir modal */

  $("#transactionDialog")
    .showModal();


  setTimeout(
    () =>
      $("#transactionDescription")
        .focus(),
    50
  );

}


/* ============================================================
   27. FECHAR MODAL
============================================================ */

function closeTransactionModal() {

  editingTransactionId =
    null;


  $("#transactionDialog")
    .close();

}


/* ============================================================
   28. SALVAR OU EDITAR LANÇAMENTO
============================================================ */

function saveTransaction(event) {

  event.preventDefault();


  /* ==========================================================
     PEGAR DADOS DO FORMULÁRIO
  ========================================================== */

  const transactionData = {

    location:
      $("#transactionLocation")
        .value,


    type:
      $("#transactionType")
        .value,


    description:
      $("#transactionDescription")
        .value
        .trim(),


    category:
      $("#transactionCategory")
        .value,


    value:
      Number(
        $("#transactionValue")
          .value
      ),


    date:
      $("#transactionDate")
        .value,


    payment:
      $("#transactionPayment")
        .value,


    notes:
      $("#transactionNotes")
        .value
        .trim()

  };


  /* ==========================================================
     VALIDAR CATEGORIA
  ========================================================== */

  const validCategories = [
    CATEGORIES.geral,
    CATEGORIES.reset,
    CATEGORIES.resetTeens
  ];


  if (
    !validCategories.includes(
      transactionData.category
    )
  ) {

    showToast(
      "Selecione uma categoria válida."
    );

    return;

  }


  /* ==========================================================
     VALIDAR CAMPOS
  ========================================================== */

  if (
    !transactionData.description
    ||
    !transactionData.date
    ||
    transactionData.value <= 0
  ) {

    showToast(
      "Preencha os campos obrigatórios."
    );

    return;

  }


  /* ==========================================================
     EDITANDO
  ========================================================== */

  if (
    editingTransactionId
    !==
    null
  ) {

    const index =
      transactions.findIndex(
        transaction =>
          transaction.id
          ===
          editingTransactionId
      );


    if (
      index !== -1
    ) {

      /*
      Mantemos ID e createdAt.

      Alteramos somente os dados editáveis.
      */

      transactions[index] = {

        ...transactions[index],

        ...transactionData

      };


      showToast(
        "Lançamento alterado com sucesso."
      );

    }

  }


  /* ==========================================================
     NOVO LANÇAMENTO
  ========================================================== */

  else {

    const newTransaction = {

      id:
        uid(),

      ...transactionData,

      createdAt:
        Date.now()

    };


    transactions.push(
      newTransaction
    );


    showToast(
      "Lançamento salvo com sucesso."
    );

  }


  /* ==========================================================
     SALVAR
  ========================================================== */

  saveTransactions();


  /* Sair da edição */

  editingTransactionId =
    null;


  /* Fechar modal */

  $("#transactionDialog")
    .close();


  /* Atualizar dashboard */

  renderDashboard();


  /* Atualizar página atual */

  if (
    $("#localPage")
      .classList.contains(
        "active"
      )
  ) {

    renderLocalPage();

  }


  /* Atualizar relatório */

  if (
    $("#reportsPage")
      .classList.contains(
        "active"
      )
  ) {

    generateReport();

  }

}


/* ============================================================
   29. EXCLUIR LANÇAMENTO
============================================================ */

function deleteTransaction(id) {

  const confirmation =
    confirm(
      "Deseja realmente excluir este lançamento?"
    );


  if (!confirmation) {

    return;

  }


  transactions =
    transactions.filter(
      transaction =>
        transaction.id
        !==
        id
    );


  saveTransactions();


  renderDashboard();


  if (
    $("#localPage")
      .classList.contains(
        "active"
      )
  ) {

    renderLocalPage();

  }


  if (
    $("#reportsPage")
      .classList.contains(
        "active"
      )
  ) {

    generateReport();

  }


  showToast(
    "Lançamento excluído."
  );

}


/* ============================================================
   30. RELATÓRIO
============================================================ */

function generateReport() {

  const start =
    $("#reportStart")
      .value;


  const end =
    $("#reportEnd")
      .value;


  const location =
    $("#reportLocation")
      .value;


  const type =
    $("#reportType")
      .value;


  /* FILTRAR */

  currentReportData =
    transactions.filter(
      transaction => {

        if (
          start
          &&
          transaction.date
          <
          start
        ) {

          return false;

        }


        if (
          end
          &&
          transaction.date
          >
          end
        ) {

          return false;

        }


        if (
          location !== "all"
          &&
          transaction.location
          !==
          location
        ) {

          return false;

        }


        if (
          type !== "all"
          &&
          transaction.type
          !==
          type
        ) {

          return false;

        }


        return true;

      }
    );


  /* ORDENAR */

  currentReportData.sort(
    (a, b) =>
      b.date.localeCompare(
        a.date
      )
      ||
      b.createdAt
      -
      a.createdAt
  );


  /* TOTAIS */

  const result =
    totals(
      currentReportData
    );


  setMoney(
    $("#reportIncome"),
    result.income
  );


  setMoney(
    $("#reportExpense"),
    result.expense
  );


  setMoney(
    $("#reportBalance"),
    result.balance,
    true
  );


  $("#reportCount")
    .textContent =
    result.count;


  /* PERÍODO */

  const periodText =
    start || end
      ?
      `${
        start
          ?
          formatDate(start)
          :
          "início"
      } até ${
        end
          ?
          formatDate(end)
          :
          "hoje"
      }`
      :
      "todo o período";


  /* LOCAL */

  const localText =
    location === "all"
      ?
      "todos os locais"
      :
      LOCATIONS[
        location
      ].name;


  /* TIPO */

  const typeText =
    type === "all"
      ?
      "entradas e saídas"
      :
      type === "entrada"
        ?
        "somente entradas"
        :
        "somente saídas";


  $("#reportDescription")
    .textContent =
    `${periodText} • ${localText} • ${typeText}`;


  $("#reportGeneratedAt")
    .textContent =
    `Gerado em ${
      new Date()
        .toLocaleString(
          "pt-BR"
        )
    }`;


  /* TABELA */

  const tbody =
    $("#reportTable");


  tbody.innerHTML =
    "";


  if (
    !currentReportData.length
  ) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="empty-state"
        >

          Nenhum registro encontrado
          para os filtros selecionados.

        </td>

      </tr>

    `;

    return;

  }


  currentReportData.forEach(
    transaction => {

      const row =
        document.createElement(
          "tr"
        );


      row.innerHTML = `

        <td>

          ${formatDate(
            transaction.date
          )}

        </td>


        <td>

          ${
            LOCATIONS[
              transaction.location
            ]?.name
            ||
            transaction.location
          }

        </td>


        <td>

          ${escapeHtml(
            transaction.description
          )}

        </td>


        <td>

          ${escapeHtml(
            transaction.category
            ||
            "GERAL"
          )}

        </td>


        <td>

          <span
            class="
              badge
              ${
                transaction.type
                ===
                "entrada"
                  ?
                  "badge-income"
                  :
                  "badge-expense"
              }
            "
          >

            ${
              transaction.type
              ===
              "entrada"
                ?
                "Entrada"
                :
                "Saída"
            }

          </span>

        </td>


        <td
          class="${
            transaction.type
            ===
            "entrada"
              ?
              "positive"
              :
              "negative"
          }"
        >

          <strong>

            ${money.format(
              transaction.value
            )}

          </strong>

        </td>

      `;


      tbody.appendChild(
        row
      );

    }
  );

}


/* ============================================================
   31. EXPORTAR CSV
============================================================ */

function exportCSV() {

  if (
    !currentReportData.length
  ) {

    showToast(
      "Gere um relatório com dados antes de exportar."
    );

    return;

  }


  const rows = [

    [
      "Data",
      "Local",
      "Descrição",
      "Categoria",
      "Tipo",
      "Valor",
      "Pagamento",
      "Observação"
    ],


    ...currentReportData.map(
      transaction => [

        formatDate(
          transaction.date
        ),

        LOCATIONS[
          transaction.location
        ]?.name
        ||
        transaction.location,

        transaction.description,

        transaction.category
        ||
        "GERAL",

        transaction.type
        ===
        "entrada"
          ?
          "Entrada"
          :
          "Saída",

        Number(
          transaction.value
        )
          .toFixed(2)
          .replace(
            ".",
            ","
          ),

        transaction.payment
        ||
        "",

        transaction.notes
        ||
        ""

      ]
    )

  ];


  const csv =
    "\uFEFF"
    +
    rows
      .map(
        row =>
          row
            .map(
              csvCell
            )
            .join(";")
      )
      .join("\n");


  downloadBlob(
    csv,
    `relatorio-financeiro-${todayISO()}.csv`,
    "text/csv;charset=utf-8"
  );


  showToast(
    "CSV exportado."
  );

}


/* ============================================================
   32. EXPORTAR BACKUP
============================================================ */

function exportBackup() {

  const data =
    JSON.stringify(
      {
        version:
          1,

        exportedAt:
          new Date()
            .toISOString(),

        transactions
      },
      null,
      2
    );


  downloadBlob(
    data,
    `backup-financeiro-${todayISO()}.json`,
    "application/json"
  );


  showToast(
    "Backup exportado."
  );

}


/* ============================================================
   33. IMPORTAR BACKUP
============================================================ */

function importBackup(file) {

  if (!file) {

    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    () => {

      try {

        const parsed =
          JSON.parse(
            reader.result
          );


        const imported =
          Array.isArray(
            parsed
          )
            ?
            parsed
            :
            parsed.transactions;


        if (
          !Array.isArray(
            imported
          )
        ) {

          throw new Error(
            "Formato inválido"
          );

        }


        const confirmation =
          confirm(
            `Importar ${
              imported.length
            } lançamento(s)? Os dados atuais serão substituídos.`
          );


        if (!confirmation) {

          return;

        }


        transactions =
          imported;


        saveTransactions();


        renderDashboard();


        if (
          $("#localPage")
            .classList.contains(
              "active"
            )
        ) {

          renderLocalPage();

        }


        if (
          $("#reportsPage")
            .classList.contains(
              "active"
            )
        ) {

          generateReport();

        }


        showToast(
          "Backup importado com sucesso."
        );

      }


      catch {

        alert(
          "Não foi possível importar o arquivo."
        );

      }


      finally {

        $("#importFile")
          .value =
          "";

      }

    };


  reader.readAsText(
    file
  );

}


/* ============================================================
   34. CSV
============================================================ */

function csvCell(value) {

  const string =
    String(
      value ?? ""
    );


  return (
    `"${string.replaceAll(
      '"',
      '""'
    )}"`
  );

}


/* ============================================================
   35. DOWNLOAD
============================================================ */

function downloadBlob(
  content,
  filename,
  type
) {

  const blob =
    new Blob(
      [content],
      {
        type
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    filename;


  link.click();


  URL.revokeObjectURL(
    url
  );

}


/* ============================================================
   36. EVITAR HTML INDESEJADO
============================================================ */

function escapeHtml(value) {

  return String(
    value
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* ============================================================
   37. DATAS PADRÃO DO RELATÓRIO
============================================================ */

function setDefaultReportDates() {

  const now =
    new Date();


  const first =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );


  const year =
    first.getFullYear();


  const month =
    String(
      first.getMonth()
      +
      1
    )
      .padStart(
        2,
        "0"
      );


  const day =
    String(
      first.getDate()
    )
      .padStart(
        2,
        "0"
      );


  $("#reportStart")
    .value =
    `${year}-${month}-${day}`;


  $("#reportEnd")
    .value =
    todayISO();

}


/* ============================================================
   38. MENU
============================================================ */

$all(".menu-item")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () =>
          navigate(
            button.dataset.page,
            button.dataset.local
          )
      );

    }
  );


/* ============================================================
   39. MENU MOBILE
============================================================ */

$("#menuToggle")
  ?.addEventListener(
    "click",
    () =>
      $("#sidebar")
        .classList.toggle(
          "open"
        )
  );


/* ============================================================
   40. NOVO LANÇAMENTO
============================================================ */

$("#newTransactionBtn")
  ?.addEventListener(
    "click",
    () =>
      openTransactionModal()
  );


/* ============================================================
   41. LANÇAMENTO NO LOCAL
============================================================ */

$("#localNewTransactionBtn")
  ?.addEventListener(
    "click",
    () =>
      openTransactionModal(
        currentLocal
      )
  );


/* ============================================================
   42. FECHAR MODAL
============================================================ */

$("#closeModalBtn")
  ?.addEventListener(
    "click",
    closeTransactionModal
  );


$("#cancelModalBtn")
  ?.addEventListener(
    "click",
    closeTransactionModal
  );


/* ============================================================
   43. SALVAR FORMULÁRIO
============================================================ */

$("#transactionForm")
  ?.addEventListener(
    "submit",
    saveTransaction
  );


/* ============================================================
   44. BUSCA
============================================================ */

$("#localSearch")
  ?.addEventListener(
    "input",
    renderLocalPage
  );


/* ============================================================
   45. EDITAR / EXCLUIR
============================================================ */

$("#localTransactionsTable")
  ?.addEventListener(
    "click",
    event => {

      /* EDITAR */

      const editId =
        event.target
          .dataset
          .editId;


      if (editId) {

        openEditTransactionModal(
          editId
        );

        return;

      }


      /* EXCLUIR */

      const deleteId =
        event.target
          .dataset
          .deleteId;


      if (deleteId) {

        deleteTransaction(
          deleteId
        );

      }

    }
  );


/* ============================================================
   46. GERAR RELATÓRIO
============================================================ */

$("#generateReportBtn")
  ?.addEventListener(
    "click",
    generateReport
  );


/* ============================================================
   47. CSV
============================================================ */

$("#exportCsvBtn")
  ?.addEventListener(
    "click",
    exportCSV
  );


/* ============================================================
   48. IMPRIMIR
============================================================ */

$("#printReportBtn")
  ?.addEventListener(
    "click",
    () =>
      window.print()
  );


/* ============================================================
   49. BACKUP
============================================================ */

$("#backupBtn")
  ?.addEventListener(
    "click",
    exportBackup
  );


/* ============================================================
   50. IMPORTAR
============================================================ */

$("#importFile")
  ?.addEventListener(
    "change",
    event =>
      importBackup(
        event.target.files[0]
      )
  );


/* ============================================================
   51. INICIALIZAÇÃO
============================================================ */

setDefaultReportDates();


renderDashboard();


renderLocalPage();


generateReport();