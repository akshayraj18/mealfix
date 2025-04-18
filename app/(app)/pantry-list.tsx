import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getPantryItems,
  addPantryItem,
  removePantryItem,
} from '@/services/pantryservice'; // Adjust path if needed

const defaultPantryItems = [
  'salt', 'pepper', 'olive oil', 'flour', 'sugar',
  'baking powder', 'butter', 'eggs', 'milk', 'rice',
  'pasta', 'soy sauce', 'vinegar', 'honey', 'garlic'
];

export default function PantryListScreen() {
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const pantry = await getPantryItems();
        setItems(pantry);
      } catch (err) {
        console.error('Failed to load pantry:', err);
      }
    })();
  }, []);

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const toggleItem = async (item: string) => {
    const isAdding = !items.includes(item);
    const updatedItems = isAdding
      ? [...items, item]
      : items.filter(i => i !== item);
    setItems(updatedItems);

    try {
      if (isAdding) {
        await addPantryItem(item);
      } else {
        await removePantryItem(item);
      }
    } catch (err) {
      console.error('Failed to update pantry item:', err);
    }
  };

  const addCustomItem = async () => {
    const item = newItem.trim().toLowerCase();
    if (item && !items.includes(item)) {
      const updated = [...items, item];
      setItems(updated);
      setNewItem('');
      try {
        await addPantryItem(item);
      } catch (err) {
        console.error('Failed to add custom item:', err);
      }
    }
  };

  const removeCustomItem = async (item: string) => {
    const updated = items.filter(i => i !== item);
    setItems(updated);
    try {
      await removePantryItem(item);
    } catch (err) {
      console.error('Failed to remove custom item:', err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Your Pantry</Text>
      <View style={styles.itemsContainer}>
        {defaultPantryItems.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.itemChip,
              items.includes(item) && styles.selectedChip,
            ]}
            onPress={() => toggleItem(item)}
          >
            <Text
              style={[
                styles.itemText,
                items.includes(item) && styles.selectedText,
              ]}
            >
              {capitalize(item)}
            </Text>
            {items.includes(item) && (
              <MaterialIcons name="check" size={16} color="#fff" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}

        {items
          .filter(i => !defaultPantryItems.includes(i))
          .map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.itemChip, styles.selectedChip]}
              onPress={() => removeCustomItem(item)}
            >
              <Text style={[styles.itemText, styles.selectedText]}>{capitalize(item)}</Text>
              <MaterialIcons name="close" size={16} color="#fff" style={styles.checkIcon} />
            </TouchableOpacity>
          ))}
      </View>

      <View style={styles.addItemContainer}>
        <TextInput
          style={styles.input}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add custom pantry item"
          onSubmitEditing={addCustomItem}
        />
        <TouchableOpacity onPress={addCustomItem} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#007AFF',
  },
  itemText: {
    fontSize: 14,
    color: '#666',
  },
  selectedText: {
    fontSize: 14,
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 4,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  input: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 14,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
