import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  Creditor,
  DEBT_KINDS,
  DebtKind,
  createId,
  formatCents,
  normalizeCreditorName,
  parseDollarsToCents,
  totalCents,
} from './src/creditorMath';
import { loadCreditors, saveCreditors } from './src/creditorStore';

export default function App() {
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [kind, setKind] = useState<DebtKind>('Credit card');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadCreditors()
      .then((saved) => {
        if (!cancelled) {
          setCreditors(saved);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessage('Could not read the list saved on this phone.');
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function addCreditor() {
    const cleanedName = normalizeCreditorName(name);
    if (cleanedName === null) {
      setMessage('Write who you owe. Keep the name under 80 characters.');
      return;
    }

    const amountCents = parseDollarsToCents(amount);
    if (amountCents === null) {
      setMessage('Write the amount like 240.50. No minus signs.');
      return;
    }

    const next: Creditor[] = [
      { id: createId(), name: cleanedName, amountCents, kind },
      ...creditors,
    ];

    try {
      await saveCreditors(next);
      setCreditors(next);
      setName('');
      setAmount('');
      setMessage(null);
    } catch {
      setMessage('Could not save. Try adding it again.');
    }
  }

  async function removeCreditor(id: string) {
    const next = creditors.filter((creditor) => creditor.id !== id);
    try {
      await saveCreditors(next);
      setCreditors(next);
      setMessage(null);
    } catch {
      setMessage('Could not remove that one. It is still on the list.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Creditors</Text>
        <Text style={styles.subtitle}>
          A list for your Legal Aid meeting. It stays on this phone.
        </Text>

        {ready ? (
          <Text style={styles.total}>Total owed {formatCents(totalCents(creditors))}</Text>
        ) : (
          <ActivityIndicator color="#1a2e1f" />
        )}

        <Text style={styles.label}>Who you owe</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Company or person"
          placeholderTextColor="#8a8178"
          style={styles.input}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <Text style={styles.label}>How much</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor="#8a8178"
          style={styles.input}
          keyboardType="decimal-pad"
          inputMode="decimal"
        />

        <Text style={styles.label}>What kind of bill</Text>
        <View style={styles.kinds}>
          {DEBT_KINDS.map((option) => {
            const selected = option === kind;
            return (
              <Pressable
                key={option}
                onPress={() => setKind(option)}
                style={[styles.kind, selected && styles.kindSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.kindText, selected && styles.kindTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={addCreditor}
          style={styles.addButton}
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>Add to the list</Text>
        </Pressable>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {ready && creditors.length === 0 ? (
          <Text style={styles.empty}>No creditors yet. Add the first one.</Text>
        ) : null}

        {creditors.map((creditor) => (
          <View key={creditor.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowName}>{creditor.name}</Text>
              <Text style={styles.rowMeta}>
                {creditor.kind} · {formatCents(creditor.amountCents)}
              </Text>
            </View>
            <Pressable
              onPress={() => removeCreditor(creditor.id)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${creditor.name}`}
              hitSlop={8}
            >
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f4ef',
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a2e1f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a5a4e',
    marginBottom: 16,
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a2e1f',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a2e1f',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fffdf9',
    borderWidth: 1,
    borderColor: '#d9d0c5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a2e1f',
    marginBottom: 14,
  },
  kinds: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  kind: {
    borderWidth: 1,
    borderColor: '#d9d0c5',
    backgroundColor: '#fffdf9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  kindSelected: {
    backgroundColor: '#1a2e1f',
    borderColor: '#1a2e1f',
  },
  kindText: {
    color: '#1a2e1f',
    fontSize: 14,
  },
  kindTextSelected: {
    color: '#f7f4ef',
  },
  addButton: {
    backgroundColor: '#1a2e1f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: '#f7f4ef',
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    color: '#8a3b2c',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  empty: {
    color: '#4a5a4e',
    fontSize: 16,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#fffdf9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a2e1f',
  },
  rowMeta: {
    marginTop: 4,
    fontSize: 15,
    color: '#4a5a4e',
  },
  remove: {
    color: '#8a3b2c',
    fontSize: 15,
    fontWeight: '600',
  },
});
