# Prova de conceito Angular

Esse repositório tem como objetivo esclarecer dúvidas sobre como publicar e hospedar aplicações do Angular no IIS, utilizando o Azure DevOps.

## Dúvidas levantadas durante a reunião de escopo

- Como trabalhar com diferentes ambientes no Angular?
- Melhor forma de proteger as variáveis de ambiente?
- Como publicar evitar o erro `404 Not Found` do IIS?

## Como trabalhar com diferentes ambientes no Angular?

O Angular possui um recurso chamado de `environment` que permite que você crie diferentes arquivos de configuração para cada ambiente que você deseja trabalhar.

Ao criar um projeto, você pode rodar o comando abaixo, para configurar previamente o compilador do Angular, para trabalhar com diferentes ambientes:

```bash
ng generate environments
```

Repare que o comando acima irá criar dois arquivos:

```bash
src/environments/environment.ts
src/environments/environment.development.ts
```

O comando também modificará configurações no arquivo `angular.json`, para que o compilador do Angular saiba qual arquivo de configuração utilizar, de acordo com o ambiente que você deseja compilar.

A configuração vai aparecer da seguinte forma:

```json
"configurations": {
  "development": {
    "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.development.ts"
        }
      ],
      …
```

Para cada novo arquivo environment.*.ts que você criar, você deve adicionar uma nova configuração `fileReplacements` no arquivo `angular.json`.

### E as Secrets?

Não armazene segredos em seu aplicativo `Angular`!

Variáveis de ambiente são incorporadas à compilação, o que significa que qualquer pessoa pode visualizá-las ao inspecionar os arquivos do seu aplicativo.

O tempo de execução (`runtime`) do `Angular` ocorre no navegador (`browser`) quando um usuário acessa o seu aplicativo web. Isso significa que o código `Angular` é interpretado e executado diretamente no navegador do usuário, permitindo que a interface do aplicativo seja dinâmica e responsiva.

Quando você desenvolve um aplicativo `Angular`, escreve código em TypeScript, HTML e CSS. Esse código é então compilado em arquivos otimizados que incluem JavaScript, HTML e CSS. Esses arquivos compilados são os que são efetivamente enviados para o navegador do usuário quando eles acessam o seu aplicativo.

Portanto, é importante entender que qualquer informação sensível ou secreta, como chaves de API privadas, que seja incorporada nos arquivos compilados do aplicativo estará acessível para qualquer pessoa que inspecionar esses arquivos diretamente no navegador. Isso ocorre porque os arquivos são baixados e executados no navegador do usuário, tornando possível a visualização do conteúdo desses arquivos.

## Alternativa ao arquivo environment.ts

Se o time de desenvolvimento não quiser utilizar o arquivo `environment`, existem formas de delegar a responsabilidade de configurar as variáveis de ambiente para a pipeline do `AzureDevops`.

Essa prático embora possível não é recomendada, pois teremos que substituir o compilador default do `AngularCli`, cujo não oferece suporte a leitura de variáveis de ambiente em tempo de compilação.

Para esse proposito, existe um pacote o pacote [@ngx-env](https://github.com/chihab/ngx-env), que permite que você leia variáveis de ambiente em tempo de compilação.

Para utilizar primeiro precisamos modificar o arquivo `tsconfig.json`:

```json
"compilerOptions": {
    "noPropertyAccessFromIndexSignature": false,
}
```

Após isso, instalar o pacote através do comando `ng add @ngx-env/builder`.

Ao rodar esse comando, repare que ele criou um arquivo `src/env.d.ts`, e modificou o arquivo `angular.json`.

A modificação do arquivo `angular.json` consiste na substituição do compilador padrão do angular pelo compilador `@ngx-env/builder`.

Existem algumas formas de referenciar as variáveis de ambiente no código, a mais coesa é através da criação de um arquivo `.env`, onde toda variável acessível pelo aplicativo começa com o prefixo `NG_APP_`.

Exemplo:

```bash
NG_APP_VARIAVEL = $_NT_SYMBOL_PATH
```

> `$_NT_SYMBOL_PATH` é uma variável de ambiente do sistema.

Para que tudo funcione, precisaremos modificar o arquivo `src/env.d.ts`, para que nosso código saiba como mapear a variável `NG_APP_VARIAVEL`.

```typescript
interface ImportMetaEnv {
  /**
   * Built-in environment variable.
   * @see Docs https://github.com/chihab/ngx-env#ng_app_env.
   */
  readonly NG_APP_ENV: string;

  // Add your environment variables below
  readonly NG_APP_VARIAVEL: string;
  
  [key: string]: any;
}
```

Após isso, podemos utilizar a variável `NG_APP_VARIAVEL` em nosso código, através da menção `import.meta.env.NG_APP_VARIAVEL`.

Para deixar o código mais desacoplado com essa solução, referencia a variável de ambiente apenas no arquivo `src/environment.ts`.

## Como publicar evitar o erro `404 Not Found` do IIS?

O erro `404 Not Found` ocorre quando o servidor não consegue encontrar o arquivo solicitado. Isso acontece pois o servidor não sabe como lidar com as rotas do Angular.

Segundo a documentação oficial do Angular: [https://angular.io/guide/deployment], o servidor deve ser configurado para redirecionar todas as solicitações para o arquivo `index.html`.

Essa configuração acontece através do módulo [URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) do IIS.

Para que tudo funcione, é obrigatório instalar esse módulo no servidor.

Para configurar o módulo, após a instalar, basta adicionar o arquivo `web.config` na raiz do projeto, com o seguinte conteúdo:

```xml
<system.webServer> 
  <rewrite> 
    <rules> 
      <rule name="Angular Routes" stopProcessing="true"> 
        <match url=".*" /> 
        <conditions logicalGrouping="MatchAll"> 
          <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" /> 
          <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" /> 
        </conditions> 
        <action type="Rewrite" url="/index.html" /> 
      </rule> 
    </rules> 
  </rewrite> 
</system.webServer>
```

E configurar o arquivo `web.config` como um `asset`, para que no momento do build, o arquivo seja copiado para a pasta `dist`. Para realizar essa configuração, basta modificar o arquivo `angular.json`, adicionando o seguinte trecho:

```json
{
    "build": {
        "options": {
        "assets": [
            "src/favicon.ico",
            "src/assets",
            "src/web.config"]
    }
}
```
