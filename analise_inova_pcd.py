#!/usr/bin/env python3
import csv
import os
import ssl
from collections import Counter, defaultdict
from datetime import datetime
from urllib.request import Request, urlopen

DATA_URL = "https://raw.githubusercontent.com/abrahao-dev/inova-pcd-dataset/main/data/atividades.csv"
DATA_FILE = "data/atividades.csv"


def baixar_csv():
    os.makedirs("data", exist_ok=True)
    if os.path.exists(DATA_FILE):
        return
    req = Request(DATA_URL, headers={"User-Agent": "python-urllib/3"})
    contexto = ssl.create_default_context()
    contexto.check_hostname = False
    contexto.verify_mode = ssl.CERT_NONE
    with urlopen(req, context=contexto) as resposta, open(DATA_FILE, "wb") as arquivo:
        arquivo.write(resposta.read())


def ler_csv(caminho):
    with open(caminho, encoding="utf-8") as arquivo:
        return list(csv.DictReader(arquivo))


def contar_por_campo(linhas, campo):
    return Counter(item.get(campo, "").strip() for item in linhas if item.get(campo))


def taxa_conclusao_por_categoria(linhas):
    soma = defaultdict(lambda: [0, 0])
    for item in linhas:
        categoria = item.get("categoria", "").strip()
        status = item.get("status", "").strip().lower()
        if not categoria:
            continue
        soma[categoria][0] += 1
        if status == "concluida":
            soma[categoria][1] += 1
    return {
        categoria: round((concluidas / total) * 100, 1)
        for categoria, (total, concluidas) in soma.items()
        if total > 0
    }


def dias_para_conclusao(item):
    criado = item.get("data_criacao", "").strip()
    concluido = item.get("data_conclusao", "").strip()
    if not criado or not concluido:
        return None
    try:
        data_criado = datetime.strptime(criado, "%Y-%m-%d")
        data_concluido = datetime.strptime(concluido, "%Y-%m-%d")
        return (data_concluido - data_criado).days
    except ValueError:
        return None


def media_lead_time(linhas):
    tempos = [dias_para_conclusao(item) for item in linhas]
    tempos = [t for t in tempos if t is not None]
    if not tempos:
        return None
    return round(sum(tempos) / len(tempos), 1)


def imprimir_contador(titulo, contador, limite=10):
    print(f"\n{titulo}")
    for valor, quantidade in contador.most_common(limite):
        print(f"{valor}: {quantidade}")


def main():
    baixar_csv()
    linhas = ler_csv(DATA_FILE)

    imprimir_contador("Distribuição por status", contar_por_campo(linhas, "status"))
    imprimir_contador("Distribuição por categoria", contar_por_campo(linhas, "categoria"))
    imprimir_contador("Distribuição por público-alvo", contar_por_campo(linhas, "publico_alvo"))

    print("\nTaxa de conclusão por categoria:")
    for categoria, taxa in sorted(taxa_conclusao_por_categoria(linhas).items(), key=lambda x: x[1], reverse=True):
        print(f"{categoria}: {taxa}%")

    lead_time = media_lead_time(linhas)
    if lead_time is not None:
        print(f"\nLead time médio das tarefas concluídas: {lead_time} dias")
    else:
        print("\nNão foi possível calcular o lead time médio.")


if __name__ == "__main__":
    main()
