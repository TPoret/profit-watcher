import Head from "next/head";
import styles from "../styles/Home.module.css";
import { getServerTime } from "../lib/binance/spot";
import { useEffect, useState } from "react";

export default function Home() {
  const [serverTimestamp, setServerTimestamp] = useState(null);

  useEffect(() => {
    getServerTime().then((serverDate) =>
      setServerTimestamp(serverDate.toUTCString())
    );
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <p>Binance timestamp is : {serverTimestamp}</p>
      </main>
    </div>
  );
}
