import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShoppingBag } from "lucide-react-native";
import Card from "@/components/common/Card";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";

/**
 * Placeholder de la sección de tienda (e-commerce). En una siguiente
 * iteración se conectará a un catálogo real (Supabase o proveedor externo)
 * y a un carrito/checkout.
 */
interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
}

const PLACEHOLDER_PRODUCTS: Product[] = [
  { id: "1", name: "Alimento Premium Adulto 15kg", price: "$45.990", category: "Alimento" },
  { id: "2", name: "Antiparasitario en Pipeta", price: "$8.990", category: "Salud" },
  { id: "3", name: "Cama Ortopédica L", price: "$32.500", category: "Accesorios" },
  { id: "4", name: "Shampoo Hipoalergénico", price: "$6.490", category: "Higiene" },
  { id: "5", name: "Correa Retráctil 5m", price: "$12.990", category: "Accesorios" },
  { id: "6", name: "Snacks Dentales x20", price: "$5.990", category: "Alimento" },
];

export default function StoreScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Tienda</Text>
        <Text style={styles.subtitle}>Próximamente: compra insumos para tu mascota</Text>
      </View>

      <FlatList
        data={PLACEHOLDER_PRODUCTS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.column}
        renderItem={({ item }) => (
          <Card style={styles.productCard}>
            <View style={styles.productImage}>
              <ShoppingBag size={28} color={Colors.primary} />
            </View>
            <Text style={styles.productCategory}>{item.category}</Text>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.productPrice}>{item.price}</Text>
            <TouchableOpacity style={styles.addToCartButton} disabled>
              <Text style={styles.addToCartText}>Próximamente</Text>
            </TouchableOpacity>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  list: { padding: Spacing.sm, paddingBottom: Spacing.xxl },
  column: { gap: Spacing.sm },
  productCard: {
    flex: 1,
    margin: Spacing.xs,
  },
  productImage: {
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: "#FFF1EC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  productCategory: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  productName: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 2,
    minHeight: 34,
  },
  productPrice: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  addToCartButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.border,
    alignItems: "center",
  },
  addToCartText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: "600",
  },
});
