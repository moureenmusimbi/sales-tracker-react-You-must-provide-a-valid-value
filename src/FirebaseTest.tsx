import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function FirebaseTest() {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      // ✅ Get all documents from "testCollection"
      const querySnapshot = await getDocs(collection(db, "testCollection"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
    }

    fetchData();
  }, []);

  const addMessage = async () => {
    // ✅ Add a test document
    await addDoc(collection(db, "testCollection"), { text: "Hello Firebase!" });
    alert("Message added!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Firebase Test</h2>
      <button onClick={addMessage}>Add Test Message</button>
      <ul>
        {messages.map(msg => (
          <li key={msg.id}>{msg.text}</li>
        ))}
      </ul>
    </div>
  );
}
