# ---- Build ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ClinicApp.Api.csproj ./
RUN dotnet restore ClinicApp.Api.csproj
COPY . ./
RUN dotnet publish ClinicApp.Api.csproj -c Release -o /app/publish

# ---- Runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "ClinicApp.Api.dll"]
