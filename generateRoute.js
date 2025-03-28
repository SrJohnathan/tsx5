const fs = require("fs");
const path = require("path");

// Função recursiva para coletar todos os arquivos de um diretório
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        } else {
            arrayOfFiles.push(filePath);
        }
    });

    return arrayOfFiles;
}

// Define a pasta de páginas (ajuste conforme sua estrutura)
const pagesDir = path.join(__dirname, "..", "src", "pages");
const allFiles = getAllFiles(pagesDir);

// Filtra apenas arquivos TSX
const tsxFiles = allFiles.filter((file) => file.endsWith(".tsx"));

// Função para converter o caminho do arquivo para a rota desejada
function parseRoutePath(filePath) {
    // Converter para caminho relativo a partir de "src/pages"
    let relativePath = path.relative(path.join(__dirname, "..", "src", "pages"), filePath);
    // Substituir backslashes por barras (para Windows)
    relativePath = relativePath.replace(/\\/g, "/");
    // Remove a extensão .tsx
    relativePath = relativePath.replace(/\.tsx$/, "");
    // Se o arquivo for "index", trata como raiz da pasta
    relativePath = relativePath.replace(/\/index$/, "");
    // Se ficar vazio, é a raiz
    if (relativePath === "") {
        return "/";
    }
    return "/" + relativePath.toLowerCase();
}

// Array para guardar os imports e os mapeamentos das rotas
const imports = [];
const routesMapping = [];

// Gera os imports e a estrutura de rotas
tsxFiles.forEach((file, index) => {
    // Caminho relativo a partir de src
    const relativeImportPath = "./" + path.relative(path.join(__dirname, "..", "src"), file).replace(/\\/g, "/");
    // Cria um identificador único para o módulo (baseado no índice ou no próprio nome)
    // Pode-se também gerar um nome baseado no caminho, removendo caracteres inválidos:
    const moduleName = "Module" + index;
    const routePath = parseRoutePath(file);

    imports.push(`import ${moduleName} from "${relativeImportPath}";`);
    routesMapping.push(`  { path: "${routePath}", component: ${moduleName} },`);
});

// Gera o conteúdo do arquivo final
const output = `${imports.join("\n")}

export const routes = [
${routesMapping.join("\n")}
];
`;

// Escreve o arquivo gerado em "src/generated-routes.ts"
const outputPath = path.join(__dirname, "..", "src", "generated-routes.ts");
fs.writeFileSync(outputPath, output);
console.log("Arquivo de rotas gerado com sucesso em:", outputPath);
